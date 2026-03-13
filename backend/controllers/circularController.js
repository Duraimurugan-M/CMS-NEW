import Circular from "../models/Circular.js";
import { parsePagination, parseSort } from "../utils/queryUtils.js";

// POST /api/circulars
export const createCircular = async (req, res, next) => {
  try {
    const circular = await Circular.create({
      ...req.body,
      publishedBy: req.user._id
    });
    res.status(201).json(circular);
  } catch (err) {
    next(err);
  }
};

// GET /api/circulars
export const getCirculars = async (req, res, next) => {
  try {
    const { audience } = req.query;
    const filter = { isActive: true };
    if (audience) {
      filter.audience = { $in: [audience, "all"] };
    }
    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(String(req.query.search), "i") },
        { content: new RegExp(String(req.query.search), "i") }
      ];
    }

    const { page, limit, skip } = parsePagination(req);
    const sort = parseSort(req, "-publishDate");

    const [items, total] = await Promise.all([
      Circular.find(filter).sort(sort).skip(skip).limit(limit),
      Circular.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/circulars/:id
export const updateCircular = async (req, res, next) => {
  try {
    const circular = await Circular.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!circular) {
      return res.status(404).json({ message: "Circular not found" });
    }
    res.json(circular);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/circulars/:id
export const deleteCircular = async (req, res, next) => {
  try {
    const circular = await Circular.findByIdAndDelete(req.params.id);
    if (!circular) {
      return res.status(404).json({ message: "Circular not found" });
    }
    res.json({ message: "Circular deleted" });
  } catch (err) {
    next(err);
  }
};

