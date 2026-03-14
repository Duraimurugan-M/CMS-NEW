import { createStudent, getStudents, getStudentById, updateStudent } from "./studentController.js";

// The admission module is based on Student model with status="pending".

export const listAdmissions = async (req, res, next) => {
  try {
    // Reuse student listing but filter by pending status
    req.query.status = "pending";
    return getStudents(req, res, next);
  } catch (err) {
    next(err);
  }
};

export const createAdmission = async (req, res, next) => {
  try {
    // Force pending status on admissions
    req.body.status = "pending";
    return createStudent(req, res, next);
  } catch (err) {
    next(err);
  }
};

export const approveAdmission = async (req, res, next) => {
  try {
    // Approve the admission by setting student status to active
    req.body.status = "active";
    return updateStudent(req, res, next);
  } catch (err) {
    next(err);
  }
};

export const rejectAdmission = async (req, res, next) => {
  try {
    // Reject the admission by setting student status to inactive
    req.body.status = "inactive";
    return updateStudent(req, res, next);
  } catch (err) {
    next(err);
  }
};
