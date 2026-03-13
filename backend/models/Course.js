import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    department: { type: String },
    durationMonths: { type: Number },
    year: { type: Number },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;

