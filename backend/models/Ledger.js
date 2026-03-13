import mongoose from "mongoose";

const ledgerEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["debit", "credit"], // debit = fee billed, credit = payment
      required: true
    },
    date: { type: Date, required: true },
    description: { type: String },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true }
  },
  { _id: false }
);

const ledgerSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", unique: true },
    entries: [ledgerEntrySchema]
  },
  { timestamps: true }
);

const Ledger = mongoose.model("Ledger", ledgerSchema);

export default Ledger;

