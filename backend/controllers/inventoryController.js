import InventoryItem from "../models/InventoryItem.js";
import InventoryTransaction from "../models/InventoryTransaction.js";

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

// POST /api/inventory/:id/transactions
export const createInventoryTransaction = async (req, res, next) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });

    const qty = Number(req.body.quantity || 0);
    if (qty <= 0) return res.status(400).json({ message: "Quantity must be greater than 0" });

    const type = req.body.type;
    let delta = 0;
    if (type === "purchase") delta = qty;
    if (type === "usage") delta = -qty;
    if (type === "adjustment") delta = Number(req.body.adjustBy || 0);

    if (item.quantity + delta < 0) {
      return res.status(400).json({ message: "Insufficient stock for this operation" });
    }

    item.quantity += delta;
    await item.save();

    const tx = await InventoryTransaction.create({
      item: item._id,
      type,
      quantity: qty,
      unitCost: Number(req.body.unitCost || 0),
      notes: req.body.notes,
      recordedBy: req.user._id
    });

    res.status(201).json({ transaction: tx, item });
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/:id/transactions
export const getInventoryTransactions = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      InventoryTransaction.find({ item: req.params.id })
        .populate("recordedBy", "name role")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      InventoryTransaction.countDocuments({ item: req.params.id })
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

