import ShopItem from "../models/ShopItem.js";
import SalesTransaction from "../models/SalesTransaction.js";
import mongoose from "mongoose";
import { parsePagination, parseSort, parseDateRange } from "../utils/queryUtils.js";

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
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(String(req.query.search), "i") },
        { code: new RegExp(String(req.query.search), "i") }
      ];
    }

    const { page, limit, skip } = parsePagination(req);
    const sort = parseSort(req);

    const [items, total] = await Promise.all([
      ShopItem.find(filter).sort(sort).skip(skip).limit(limit),
      ShopItem.countDocuments(filter)
    ]);
    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// POST /api/sales
export const createSale = async (req, res, next) => {
  try {
    const { student, lines, isCanteen, paymentMode } = req.body;
    const session = await mongoose.startSession();
    let sale;

    await session.withTransaction(async () => {
      let totalAmount = 0;
      const normalizedLines = [];

      // Validate stock before deduction
      for (const line of lines) {
        const item = await ShopItem.findById(line.item).session(session);
        if (!item || !item.isActive) {
          throw new Error("Invalid item in sale");
        }
        const quantity = Number(line.quantity || 0);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          const err = new Error(`Invalid quantity for ${item.name}`);
          err.statusCode = 400;
          throw err;
        }
        if (item.stock < quantity) {
          const err = new Error(`Insufficient stock for ${item.name}`);
          err.statusCode = 400;
          throw err;
        }
        const price = Number(line.price ?? item.price);
        const total = Number((price * quantity).toFixed(2));
        totalAmount += total;
        normalizedLines.push({
          item: item._id,
          quantity,
          price,
          total
        });
      }

      // Deduct stock
      for (const line of normalizedLines) {
        const updated = await ShopItem.findOneAndUpdate(
          { _id: line.item, stock: { $gte: line.quantity } },
          { $inc: { stock: -line.quantity } },
          { session, new: true }
        );
        if (!updated) {
          const err = new Error("Stock changed during checkout. Please retry.");
          err.statusCode = 409;
          throw err;
        }
      }

      const created = await SalesTransaction.create(
        [
          {
            student,
            lines: normalizedLines,
            totalAmount,
            isCanteen,
            paymentMode,
            createdBy: req.user._id
          }
        ],
        { session }
      );
      sale = created[0];
    });

    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

// GET /api/sales
export const listSales = async (req, res, next) => {
  try {
    const filter = {
      ...parseDateRange(req, "createdAt")
    };
    if (req.query.student) filter.student = req.query.student;
    if (req.query.isCanteen !== undefined) filter.isCanteen = req.query.isCanteen === "true";

    const { page, limit, skip } = parsePagination(req);
    const sort = parseSort(req);

    const [items, total] = await Promise.all([
      SalesTransaction.find(filter).populate("student").sort(sort).skip(skip).limit(limit),
      SalesTransaction.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

