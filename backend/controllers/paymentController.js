import Payment from "../models/Payment.js";
import { createRazorpayOrderForInvoice, markPaymentSuccess } from "../services/paymentService.js";
import { parsePagination, parseSort, parseDateRange } from "../utils/queryUtils.js";

// POST /api/payments/create
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { studentId, invoiceId, amount } = req.body;
    const { order, payment } = await createRazorpayOrderForInvoice({
      studentId,
      invoiceId,
      amount
    });
    res.status(201).json({ order, paymentId: payment._id });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/verify
export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, razorpayPaymentId, razorpaySignature } = req.body;
    const payment = await markPaymentSuccess({
      paymentId,
      razorpayPaymentId,
      razorpaySignature
    });
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

// GET /api/payments
export const listPayments = async (req, res, next) => {
  try {
    const filter = {
      ...parseDateRange(req, "createdAt")
    };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.method) filter.method = req.query.method;
    if (req.query.student) filter.student = req.query.student;

    const { page, limit, skip } = parsePagination(req);
    const sort = parseSort(req);

    const [items, total] = await Promise.all([
      Payment.find(filter).populate("student invoice").sort(sort).skip(skip).limit(limit),
      Payment.countDocuments(filter)
    ]);
    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/student/:id
export const getStudentPayments = async (req, res, next) => {
  try {
    const filter = { student: req.params.id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Payment.find(filter).sort("-createdAt").skip(skip).limit(limit),
      Payment.countDocuments(filter)
    ]);
    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

