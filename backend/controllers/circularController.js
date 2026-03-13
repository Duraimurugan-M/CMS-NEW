import Circular from "../models/Circular.js";

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
    const circulars = await Circular.find(filter).sort("-publishDate");
    res.json(circulars);
  } catch (err) {
    next(err);
  }
};

