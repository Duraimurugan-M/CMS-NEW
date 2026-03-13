import InventoryItem from "../models/InventoryItem.js";

// POST /api/inventory
export const createInventoryItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory
export const getInventoryItems = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.name = new RegExp(String(req.query.search), "i");
    }
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      InventoryItem.find(filter).sort("-createdAt").skip(skip).limit(limit),
      InventoryItem.countDocuments(filter)
    ]);
    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/inventory/:id
export const updateInventoryItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!item) return res.status(404).json({ message: "Inventory item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

