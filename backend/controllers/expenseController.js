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
    const expenses = await Expense.find().sort("-expenseDate");
    res.json(expenses);
  } catch (err) {
    next(err);
  }
};

