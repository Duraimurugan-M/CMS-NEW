import mongoose from "mongoose";

const salesLineSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "ShopItem", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true }
  },
  { _id: false }
);

const salesTransactionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    lines: [salesLineSchema],
    totalAmount: { type: Number, required: true },
    isCanteen: { type: Boolean, default: false },
    paymentMode: {
      type: String,
      enum: ["cash", "card", "upi", "wallet"],
      default: "cash"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const SalesTransaction = mongoose.model("SalesTransaction", salesTransactionSchema);

export default SalesTransaction;

