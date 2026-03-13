import ShopItem from "../models/ShopItem.js";
import SalesTransaction from "../models/SalesTransaction.js";

// POST /api/shop-items
export const createShopItem = async (req, res, next) => {
  try {
    const item = await ShopItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// GET /api/shop-items
export const getShopItems = async (req, res, next) => {
  try {
    const { isCanteen } = req.query;
    const filter = {};
    if (isCanteen !== undefined) {
      filter.isCanteen = isCanteen === "true";
    }
    const items = await ShopItem.find(filter);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// POST /api/sales
export const createSale = async (req, res, next) => {
  try {
    const { student, lines, isCanteen, paymentMode } = req.body;
    let totalAmount = 0;
    for (const line of lines) {
      totalAmount += line.total;
      await ShopItem.findByIdAndUpdate(line.item, { $inc: { stock: -line.quantity } });
    }

    const sale = await SalesTransaction.create({
      student,
      lines,
      totalAmount,
      isCanteen,
      paymentMode,
      createdBy: req.user._id
    });

    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

