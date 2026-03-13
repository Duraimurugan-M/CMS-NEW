import mongoose from "mongoose";

const parentContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    relation: { type: String, required: true }, // father, mother, guardian
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String }
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    regNumber: { type: String, required: true, unique: true, sparse: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: { type: Date },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    admissionDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "alumni", "suspended"],
      default: "active"
    },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    batch: { type: String },
    parents: [parentContactSchema],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;

