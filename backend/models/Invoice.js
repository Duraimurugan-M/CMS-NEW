import mongoose from "mongoose";

const invoiceLineSchema = new mongoose.Schema(
  {
    feeHead: { type: mongoose.Schema.Types.ObjectId, ref: "FeeHead", required: true },
    label: { type: String },
    amount: { type: Number, required: true },
    dueDate: { type: Date },
    fineAmount: { type: Number, default: 0 }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    invoiceNo: { type: String, required: true, unique: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date },
    lines: [invoiceLineSchema],
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid", "cancelled"],
      default: "unpaid"
    },
    isAdvance: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;

