import jwt from "jsonwebtoken";
import crypto from "crypto";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";

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

const buildAuthPayload = async (user) => {
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
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      student: user.student || null,
      parent: user.parent || null
    }
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

    const { email, phone, password } = req.body;

    const query = email ? { email } : { phone };
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
    res.json(req.user);
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
