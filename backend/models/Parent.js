import mongoose from "mongoose";

const parentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    relation: { type: String, required: true }, // father, mother, guardian
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const Parent = mongoose.model("Parent", parentSchema);

export default Parent;

