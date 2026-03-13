import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";

const signToken = (user) => {
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

// POST /api/auth/bootstrap
// Create initial superadmin if none exists
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

    const token = signToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        student: user.student || null,
        parent: user.parent || null
      }
    });
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

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        student: user.student || null,
        parent: user.parent || null
      }
    });
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
// On JWT, logout is client-side; this is mainly semantic
export const logout = async (req, res, next) => {
  try {
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

