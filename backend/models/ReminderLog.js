import mongoose from "mongoose";

const reminderLogSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["fee_due"], required: true },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    dayOffset: { type: Number, required: true }, // -3 before, 0 on day, +1 after
    sentAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

reminderLogSchema.index({ kind: 1, invoice: 1, dayOffset: 1 }, { unique: true });

const ReminderLog = mongoose.model("ReminderLog", reminderLogSchema);

export default ReminderLog;

