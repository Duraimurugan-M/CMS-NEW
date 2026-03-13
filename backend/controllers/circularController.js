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

