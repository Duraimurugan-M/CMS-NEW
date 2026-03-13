import Student from "../models/Student.js";
import Ledger from "../models/Ledger.js";
import { generateRegistrationNumber } from "../utils/generateRegNumber.js";

// POST /api/students
export const createStudent = async (req, res, next) => {
  try {
    const regNumber = await generateRegistrationNumber();
    const student = await Student.create({
      ...req.body,
      regNumber
    });

    // Create empty ledger
    await Ledger.create({ student: student._id, entries: [] });

    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
};

// GET /api/students
export const getStudents = async (req, res, next) => {
  try {
    const { search, course, status } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, "i") },
        { lastName: new RegExp(search, "i") },
        { regNumber: new RegExp(search, "i") }
      ];
    }
    if (course) filter.course = course;
    if (status) filter.status = status;

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Student.find(filter).populate("course").sort("-createdAt").skip(skip).limit(limit),
      Student.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:id
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate("course");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/students/:id
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student deleted" });
  } catch (err) {
    next(err);
  }
};

