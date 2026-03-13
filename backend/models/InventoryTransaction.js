import mongoose from "mongoose";

const inventoryTransactionSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem", required: true },
    type: { type: String, enum: ["purchase", "usage", "adjustment"], required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, default: 0 },
    notes: { type: String },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const InventoryTransaction = mongoose.model("InventoryTransaction", inventoryTransactionSchema);

export default InventoryTransaction;
