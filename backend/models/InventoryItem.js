import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["academic", "hostel", "general"],
      required: true
    },
    sku: { type: String, unique: true },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: "pcs" },
    minQuantity: { type: Number, default: 0 },
    location: { type: String },
    lastPurchaseDate: { type: Date }
  },
  { timestamps: true }
);

const InventoryItem = mongoose.model("InventoryItem", inventoryItemSchema);

export default InventoryItem;

