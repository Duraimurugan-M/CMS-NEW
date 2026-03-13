import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    type: {
      type: String,
      enum: [
        "fee_reminder",
        "payment_confirmation",
        "leave_status",
        "outpass_status",
        "checkin_alert",
        "circular",
        "generic"
      ],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: {
      type: [String],
      enum: ["email", "sms", "in_app"],
      default: ["in_app"]
    },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

