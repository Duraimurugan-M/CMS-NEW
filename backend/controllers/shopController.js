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
    const session = await mongoose.startSession();
    let sale;

    await session.withTransaction(async () => {
      let totalAmount = 0;

      // Validate stock before deduction
      for (const line of lines) {
        const item = await ShopItem.findById(line.item).session(session);
        if (!item || !item.isActive) {
          throw new Error("Invalid item in sale");
        }
        if (item.stock < line.quantity) {
          const err = new Error(`Insufficient stock for ${item.name}`);
          err.statusCode = 400;
          throw err;
        }
        totalAmount += line.total;
      }

      // Deduct stock
      for (const line of lines) {
        await ShopItem.findByIdAndUpdate(
          line.item,
          { $inc: { stock: -line.quantity } },
          { session }
        );
      }

      const created = await SalesTransaction.create(
        [
          {
            student,
            lines,
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

