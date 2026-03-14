import Parent from "../models/Parent.js";
import Student from "../models/Student.js";

export const enrichAuthUser = async (user) => {
  let linkedStudent = user.student || null;
  let regNumber = null;

  if (!linkedStudent && user.parent) {
    const parent = await Parent.findById(user.parent).select("student");
    linkedStudent = parent?.student || null;
  }

  if (!linkedStudent && user.role === "student") {
    const student = await Student.findOne({ user: user._id }).select("_id regNumber");
    linkedStudent = student?._id || null;
    regNumber = student?.regNumber || null;
  }

  if (!regNumber && linkedStudent) {
    const student = await Student.findById(linkedStudent).select("regNumber");
    regNumber = student?.regNumber || null;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email || null,
    phone: user.phone || null,
    role: user.role,
    student: user.student || null,
    parent: user.parent || null,
    linkedStudent,
    regNumber
  };
};
