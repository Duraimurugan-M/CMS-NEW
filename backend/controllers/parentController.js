import Parent from "../models/Parent.js";

// GET /api/parents
export const listParents = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(String(req.query.search), "i") },
        { phone: new RegExp(String(req.query.search), "i") },
        { email: new RegExp(String(req.query.search), "i") }
      ];
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Parent.find(filter).populate("student", "regNo firstName lastName").sort("-createdAt").skip(skip).limit(limit),
      Parent.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};
