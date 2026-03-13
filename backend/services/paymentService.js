import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import { addLedgerEntry } from "./ledgerService.js";
import { notifyUser } from "./notificationService.js";
import Student from "../models/Student.js";

const razorpayInstance =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      })
    : null;

export const createRazorpayOrderForInvoice = async ({ studentId, invoiceId, amount }) => {
  if (!razorpayInstance) {
    throw new Error("Razorpay not configured");
  }

  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `INV-${invoiceId}`
  };

  const order = await razorpayInstance.orders.create(options);

  const payment = await Payment.create({
    student: studentId,
    invoice: invoiceId,
    amount,
    razorpayOrderId: order.id,
    status: "created"
  });

  return { order, payment };
};

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  return expected === signature;
};

export const markPaymentSuccess = async ({ paymentId, razorpayPaymentId, razorpaySignature }) => {
  const session = await mongoose.startSession();
  try {
    let updatedPayment;

    await session.withTransaction(async () => {
      const payment = await Payment.findById(paymentId).session(session).populate("student invoice");
      if (!payment) throw new Error("Payment not found");

      if (
        !verifyRazorpaySignature({
          orderId: payment.razorpayOrderId,
          paymentId: razorpayPaymentId,
          signature: razorpaySignature
        })
      ) {
        throw new Error("Invalid Razorpay signature");
      }

      // Idempotency guard
      if (payment.status === "success") {
        updatedPayment = payment;
        return;
      }

      payment.status = "success";
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      await payment.save({ session });

      if (payment.invoice) {
        const invoice = await Invoice.findById(payment.invoice._id).session(session);
        invoice.paidAmount += payment.amount;
        if (invoice.paidAmount >= invoice.totalAmount) {
          invoice.status = "paid";
        } else if (invoice.paidAmount > 0) {
          invoice.status = "partially_paid";
        }
        await invoice.save({ session });
      }

      await addLedgerEntry({
        studentId: payment.student._id,
        type: "credit",
        amount: payment.amount,
        description: "Payment received via online gateway",
        invoiceId: payment.invoice?._id,
        paymentId: payment._id,
        session
      });

      updatedPayment = payment;
    });

    // Notification outside transaction (non-critical side-effect)
    const student = await Student.findById(updatedPayment.student._id).populate("user");
    if (student?.user) {
      await notifyUser({
        user: student.user,
        student: student._id,
        type: "payment_confirmation",
        title: "Fee payment received",
        message: `We have received a payment of ₹${updatedPayment.amount}.`,
        channels: ["in_app", "email"]
      });
    }

    return updatedPayment;
  } finally {
    session.endSession();
  }
};

