import { validationResult } from "express-validator";
import FeeHead from "../models/FeeHead.js";
import Invoice from "../models/Invoice.js";
import { addLedgerEntry } from "../services/ledgerService.js";
import dayjs from "dayjs";
import { notifyUser } from "../services/notificationService.js";
import Student from "../models/Student.js";

// CRUD for fee heads

// POST /api/fees
export const createFeeHead = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const feeHead = await FeeHead.create(req.body);
    res.status(201).json(feeHead);
  } catch (err) {
    next(err);
  }
};

// GET /api/fees
export const getFeeHeads = async (req, res, next) => {
  try {
    const feeHeads = await FeeHead.find();
    res.json(feeHeads);
  } catch (err) {
    next(err);
  }
};

// PUT /api/fees/:id
export const updateFeeHead = async (req, res, next) => {
  try {
    const feeHead = await FeeHead.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!feeHead) {
      return res.status(404).json({ message: "Fee head not found" });
    }
    res.json(feeHead);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/fees/:id
export const deleteFeeHead = async (req, res, next) => {
  try {
    const feeHead = await FeeHead.findByIdAndDelete(req.params.id);
    if (!feeHead) {
      return res.status(404).json({ message: "Fee head not found" });
    }
    res.json({ message: "Fee head deleted" });
  } catch (err) {
    next(err);
  }
};

// Invoice creation helper: generate invoice for student with lines and ledger debit

// POST /api/fees/invoices
export const createInvoice = async (req, res, next) => {
  try {
    const { student, lines, dueDate, isAdvance = false } = req.body;

    const totalAmount = lines.reduce((sum, l) => sum + Number(l.amount || 0), 0);
    const issueDate = dayjs().toDate();

    const invoiceNo = `INV-${dayjs().format("YYYYMMDDHHmmss")}-${Math.floor(
      Math.random() * 1000
    )}`;

    const invoice = await Invoice.create({
      student,
      invoiceNo,
      issueDate,
      dueDate,
      lines,
      totalAmount,
      paidAmount: 0,
      status: "unpaid",
      isAdvance
    });

    await addLedgerEntry({
      studentId: student,
      type: "debit",
      amount: totalAmount,
      description: isAdvance ? "Advance fee billed" : "Fee billed",
      invoiceId: invoice._id
    });

    // Optional: immediate due-date reminder email if dueDate is near
    if (dueDate) {
      const s = await Student.findById(student).populate("user");
      if (s?.user) {
        await notifyUser({
          user: s.user,
          student: s._id,
          type: "fee_reminder",
          title: "New fee invoice generated",
          message: `An invoice of ₹${totalAmount} is due on ${dayjs(dueDate).format(
            "DD/MM/YYYY"
          )}.`,
          channels: ["in_app"]
        });
      }
    }

    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
};

