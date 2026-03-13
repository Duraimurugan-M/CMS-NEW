import mongoose from "mongoose";

const outpassRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // parent
    exitDateTime: { type: Date, required: true },
    expectedReturnDateTime: { type: Date },
    actualReturnDateTime: { type: Date },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending"
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    remarks: { type: String }
  },
  { timestamps: true }
);

const OutpassRequest = mongoose.model("OutpassRequest", outpassRequestSchema);

export default OutpassRequest;

