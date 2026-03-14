import jwt from "jsonwebtoken";
import crypto from "crypto";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import Student from "../models/Student.js";
import OtpCode from "../models/OtpCode.js";
import { notifyUser } from "../services/notificationService.js";
import { enrichAuthUser } from "../utils/authPayload.js";

const signAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
};

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const buildAuthPayload = async (user) => {
  const token = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return {
    token,
    refreshToken,
    user: await enrichAuthUser(user)
  };
};

// POST /api/auth/bootstrap
export const bootstrapSuperadmin = async (req, res, next) => {
  try {
    const existing = await User.findOne({ role: "superadmin" });
    if (existing) {
      return res.status(400).json({ message: "Superadmin already exists" });
    }

    const { name, email, password, phone } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "superadmin"
    });

    const payload = await buildAuthPayload(user);
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email: identifier, password } = req.body;
    const identifierValue = (identifier || "").trim();
    if (!identifierValue) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    // Allow login using either email or phone (frontend uses a single field for both)
    const isEmail = /@/.test(identifierValue);
    const query = isEmail ? { email: identifierValue.toLowerCase() } : { phone: identifierValue };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User account is disabled" });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = await buildAuthPayload(user);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const sendOtp = async (req, res, next) => {
  try {
    const { regNo, phone } = req.body;
    if (!regNo) return res.status(400).json({ message: "regNo is required" });

    const student = await Student.findOne({ regNumber: regNo }).populate("user");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const phoneToUse = phone || student.user?.phone || student.phone;
    if (!phoneToUse) {
      return res.status(400).json({ message: "Phone number not available for student" });
    }
    if (phone && phone !== phoneToUse) {
      return res.status(400).json({ message: "Phone number does not match student record" });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await OtpCode.create({
      student: student._id,
      phone: phoneToUse,
      code,
      expiresAt
    });

    // Send OTP (SMS placeholder)
    if (student.user) {
      await notifyUser({
        user: student.user,
        student: student._id,
        type: "generic",
        title: "Your OTP code",
        message: `Your login OTP is ${code} (valid for 5 minutes)`,
        channels: ["sms", "in_app"]
      });
    } else {
      // If no user exists, just send SMS placeholder
      await notifyUser({
        user: { phone: phoneToUse },
        student: student._id,
        type: "generic",
        title: "Your OTP code",
        message: `Your login OTP is ${code} (valid for 5 minutes)`,
        channels: ["sms"]
      });
    }

    res.json({ message: "OTP sent" });
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { regNo, phone, code } = req.body;
    if (!regNo || !phone || !code) {
      return res.status(400).json({ message: "regNo, phone and code are required" });
    }

    const student = await Student.findOne({ regNumber: regNo }).populate("user");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const otp = await OtpCode.findOne({
      student: student._id,
      phone,
      code,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otp) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    otp.used = true;
    await otp.save();

    let user = student.user;
    if (!user) {
      user = await User.create({
        name: `${student.firstName} ${student.lastName || ""}`.trim(),
        phone,
        role: "student",
        student: student._id,
        password: Math.random().toString(36).slice(-8)
      });
      student.user = user._id;
      await student.save();
    }

    const payload = await buildAuthPayload(user);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    const dbToken = await RefreshToken.findOne({ tokenHash: hashToken(refreshToken), isRevoked: false });
    if (!dbToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not available" });
    }

    dbToken.isRevoked = true;
    await dbToken.save();

    const accessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    await RefreshToken.create({
      user: user._id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({ token: accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile
export const getProfile = async (req, res, next) => {
  try {
    res.json(await enrichAuthUser(req.user));
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.findOneAndUpdate(
        { tokenHash: hashToken(refreshToken) },
        { isRevoked: true }
      );
    }
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};
