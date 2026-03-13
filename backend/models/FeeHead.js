import mongoose from "mongoose";

const feeHeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tuition, Transport, Hostel, Exam, etc.
    code: { type: String, required: true, unique: true },
    description: { type: String },
    isOptional: { type: Boolean, default: false },
    isRecurring: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    defaultAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const FeeHead = mongoose.model("FeeHead", feeHeadSchema);

export default FeeHead;

