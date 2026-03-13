import mongoose from "mongoose";

const shopItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, unique: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    isCanteen: { type: Boolean, default: false }, // false = shop
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const ShopItem = mongoose.model("ShopItem", shopItemSchema);

export default ShopItem;

