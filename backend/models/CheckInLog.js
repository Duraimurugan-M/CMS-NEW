import mongoose from "mongoose";

const checkInLogSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    type: {
      type: String,
      enum: ["checkin", "checkout"],
      required: true
    },
    location: {
      type: String,
      enum: ["hostel", "gate", "library", "other"],
      default: "gate"
    },
    timestamp: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const CheckInLog = mongoose.model("CheckInLog", checkInLogSchema);

export default CheckInLog;

