import Parent from "../models/Parent.js";
import Student from "../models/Student.js";

const ADMIN_ROLES = new Set(["superadmin", "admin", "accountant", "staff"]);

export const isPrivilegedRole = (role) => ADMIN_ROLES.has(role);

export const resolveLinkedStudentId = async (user) => {
  if (!user) return null;
  if (user.student) return String(user.student);

  if (user.parent) {
    const parent = await Parent.findById(user.parent).select("student");
    if (parent?.student) return String(parent.student);
  }

  if (user.role === "student") {
    const student = await Student.findOne({ user: user._id }).select("_id");
    return student ? String(student._id) : null;
  }

  if (user.role === "parent") {
    const parent = await Parent.findOne({ user: user._id }).select("student");
    return parent?.student ? String(parent.student) : null;
  }

  return null;
};

export const assertStudentAccess = async ({ user, studentId }) => {
  if (isPrivilegedRole(user?.role)) return true;

  const linkedStudentId = await resolveLinkedStudentId(user);
  return linkedStudentId && String(linkedStudentId) === String(studentId);
};
