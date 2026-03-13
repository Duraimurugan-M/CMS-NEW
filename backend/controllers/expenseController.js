import Expense from "../models/Expense.js";

// POST /api/expenses
export const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      recordedBy: req.user._id
    });
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

// GET /api/expenses
export const getExpenses = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.from || req.query.to) {
      filter.expenseDate = {};
      if (req.query.from) filter.expenseDate.$gte = new Date(req.query.from);
      if (req.query.to) filter.expenseDate.$lte = new Date(req.query.to);
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Expense.find(filter).sort("-expenseDate").skip(skip).limit(limit),
      Expense.countDocuments(filter)
    ]);
    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

