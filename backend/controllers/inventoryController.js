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
    const items = await InventoryItem.find();
    res.json(items);
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

