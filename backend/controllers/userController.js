import User from "../models/User.js";
import Student from "../models/Student.js";
import Parent from "../models/Parent.js";

// GET /api/users
export const listUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(String(req.query.search), "i") },
        { email: new RegExp(String(req.query.search), "i") },
        { phone: new RegExp(String(req.query.search), "i") }
      ];
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      User.find(filter).select("-password").sort("-createdAt").skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// POST /api/users
export const createUser = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.student) delete payload.student;
    if (!payload.parent) delete payload.parent;

    const user = await User.create(payload);

    if (user.role === "student" && user.student) {
      await Student.findByIdAndUpdate(user.student, { user: user._id });
    }
    if (user.role === "parent" && user.parent) {
      await Parent.findByIdAndUpdate(user.parent, { user: user._id });
    }

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "User not found" });

    const payload = { ...req.body };
    delete payload.password;
    if (!payload.student) payload.student = undefined;
    if (!payload.parent) payload.parent = undefined;
    const user = await User.findByIdAndUpdate(req.params.id, payload, { new: true }).select("-password");

    if (user.role === "student" && user.student) {
      await Student.updateMany({ user: user._id, _id: { $ne: user.student } }, { $unset: { user: 1 } });
      await Student.findByIdAndUpdate(user.student, { user: user._id });
    }
    if (user.role === "parent" && user.parent) {
      await Parent.updateMany({ user: user._id, _id: { $ne: user.parent } }, { $unset: { user: 1 } });
      await Parent.findByIdAndUpdate(user.parent, { user: user._id });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id/password
export const resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = req.body.password;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};
