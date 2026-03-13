import { validationResult } from "express-validator";
import Course from "../models/Course.js";
import { parsePagination, parseSort } from "../utils/queryUtils.js";

// POST /api/courses
export const createCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

// GET /api/courses
export const getCourses = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(String(req.query.search), "i") },
        { code: new RegExp(String(req.query.search), "i") },
        { department: new RegExp(String(req.query.search), "i") }
      ];
    }
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

    const { page, limit, skip } = parsePagination(req);
    const sort = parseSort(req);

    const [items, total] = await Promise.all([
      Course.find(filter).sort(sort).skip(skip).limit(limit),
      Course.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/courses/:id
export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/courses/:id
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course deleted" });
  } catch (err) {
    next(err);
  }
};

