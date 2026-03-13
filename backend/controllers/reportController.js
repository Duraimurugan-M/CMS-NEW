import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import InventoryItem from "../models/InventoryItem.js";
import Expense from "../models/Expense.js";
import SalesTransaction from "../models/SalesTransaction.js";
import Book from "../models/Book.js";
import BookIssue from "../models/BookIssue.js";

// GET /api/reports/fees
export const getFeeReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const payments = await Payment.find(filter);
    const invoices = await Invoice.find(filter);

    const totalCollected = payments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

    res.json({
      totalBilled,
      totalCollected,
      totalPending: totalBilled - totalCollected,
      payments,
      invoices
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/inventory
export const getInventoryReport = async (req, res, next) => {
  try {
    const items = await InventoryItem.find();
    res.json({
      totalItems: items.length,
      items
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/expenses
export const getExpenseReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from || to) {
      filter.expenseDate = {};
      if (from) filter.expenseDate.$gte = new Date(from);
      if (to) filter.expenseDate.$lte = new Date(to);
    }
    const expenses = await Expense.find(filter);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ total, expenses });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/canteen-shop
export const getCanteenShopReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const sales = await SalesTransaction.find(filter);
    const totalCanteen = sales
      .filter((s) => s.isCanteen)
      .reduce((sum, s) => sum + s.totalAmount, 0);
    const totalShop = sales
      .filter((s) => !s.isCanteen)
      .reduce((sum, s) => sum + s.totalAmount, 0);
    res.json({ totalCanteen, totalShop, sales });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/library
export const getLibraryReport = async (req, res, next) => {
  try {
    const totalBooks = await Book.countDocuments();
    const activeIssues = await BookIssue.countDocuments({ returnDate: { $exists: false } });
    const issues = await BookIssue.find();
    const totalFines = issues.reduce((sum, i) => sum + (i.fineAmount || 0), 0);
    res.json({ totalBooks, activeIssues, totalFines });
  } catch (err) {
    next(err);
  }
};

