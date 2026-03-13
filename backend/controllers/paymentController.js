import Payment from "../models/Payment.js";
import { createRazorpayOrderForInvoice, markPaymentSuccess } from "../services/paymentService.js";

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

// GET /api/payments/student/:id
export const getStudentPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.params.id }).sort("-createdAt");
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

