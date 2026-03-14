import dayjs from "dayjs";
import Student from "../models/Student.js";
import Course from "../models/Course.js";

// Generates registration number using:
// - last two digits of year (e.g., 26)
// - department code (e.g., BCA)
// - sequence number (0001)
// Example: 26BCA-0001
export const generateRegistrationNumber = async ({ courseId, department } = {}) => {
  const year = dayjs().format("YY");

  let deptCode = department;
  if (courseId && !deptCode) {
    const course = await Course.findById(courseId).select("department code");
    if (course) {
      deptCode = course.department || course.code;
    }
  }

  deptCode = (deptCode || "GEN").toUpperCase().slice(0, 3);
  const prefix = `${year}${deptCode}`;

  const count = await Student.countDocuments({ regNumber: { $regex: `^${prefix}` } });
  const serial = String(count + 1).padStart(4, "0");

  return `${prefix}-${serial}`;
};

