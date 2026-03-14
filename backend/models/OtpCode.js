import mongoose from "mongoose";

const otpCodeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    phone: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

otpCodeSchema.index({ student: 1, phone: 1, code: 1 });

const OtpCode = mongoose.model("OtpCode", otpCodeSchema);

export default OtpCode;
