import mongoose from "mongoose";

const circularSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    audience: {
      type: [String],
      enum: ["students", "parents", "staff", "all"],
      default: ["all"]
    },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    publishDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Circular = mongoose.model("Circular", circularSchema);

export default Circular;

