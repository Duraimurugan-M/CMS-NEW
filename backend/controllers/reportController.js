import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import InventoryItem from "../models/InventoryItem.js";
import Expense from "../models/Expense.js";
import SalesTransaction from "../models/SalesTransaction.js";
import Book from "../models/Book.js";
import BookIssue from "../models/BookIssue.js";
import { parsePagination, parseSort, parseDateRange } from "../utils/queryUtils.js";

// GET /api/reports/fees
export const getFeeReport = async (req, res, next) => {
  try {
    const filter = parseDateRange(req, "createdAt");

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

// GET /api/reports/pending-dues
export const getPendingDuesReport = async (req, res, next) => {
  try {
    const filter = {
      ...parseDateRange(req, "dueDate"),
      status: { $in: ["unpaid", "partially_paid"] }
    };
    if (req.query.student) filter.student = req.query.student;

    const { page, limit, skip } = parsePagination(req);
    const sort = parseSort(req, "dueDate");

    const [items, total] = await Promise.all([
      Invoice.find(filter)
        .populate({ path: "student", populate: { path: "course" } })
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(filter)
    ]);

    const pendingAmount = items.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit), pendingAmount });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/inventory
export const getInventoryReport = async (req, res, next) => {
  try {
    const items = await InventoryItem.find();
    const lowStockItems = items.filter((i) => i.quantity <= i.minQuantity);
    res.json({
      totalItems: items.length,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      items
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/expenses
export const getExpenseReport = async (req, res, next) => {
  try {
    const filter = parseDateRange(req, "expenseDate");
    if (req.query.category) filter.category = req.query.category;
    const expenses = await Expense.find(filter);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = expenses.reduce((acc, row) => {
      const key = row.category || "other";
      acc[key] = (acc[key] || 0) + row.amount;
      return acc;
    }, {});
    res.json({ total, byCategory, expenses });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/canteen-shop
export const getCanteenShopReport = async (req, res, next) => {
  try {
    const filter = parseDateRange(req, "createdAt");
    if (req.query.student) filter.student = req.query.student;
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
    const issues = await BookIssue.find().populate("book student");
    const totalFines = issues.reduce((sum, i) => sum + (i.fineAmount || 0), 0);
    res.json({ totalBooks, activeIssues, totalFines, issues });
  } catch (err) {
    next(err);
  }
};

