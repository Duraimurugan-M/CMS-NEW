import { validationResult } from "express-validator";
import Student from "../models/Student.js";
import Ledger from "../models/Ledger.js";
import { generateRegistrationNumber } from "../utils/generateRegNumber.js";

// POST /api/students
export const createStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const regNo = await generateRegistrationNumber();
    const student = await Student.create({
      ...req.body,
      regNo
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
    const { search, course } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, "i") },
        { lastName: new RegExp(search, "i") },
        { regNo: new RegExp(search, "i") }
      ];
    }
    if (course) filter.course = course;

    const students = await Student.find(filter).populate("course");
    res.json(students);
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

