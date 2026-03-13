import OutpassRequest from "../models/OutpassRequest.js";
import Student from "../models/Student.js";
import Parent from "../models/Parent.js";
import { notifyUser } from "../services/notificationService.js";
import { parsePagination, parseSort, parseDateRange } from "../utils/queryUtils.js";

const resolveStudentIdForRequest = async (req) => {
  if (req.body.student) return req.body.student;

  if (req.user.role === "student") {
    if (req.user.student) return req.user.student;
    const student = await Student.findOne({ user: req.user._id }).select("_id");
    return student?._id;
  }

  if (req.user.role === "parent") {
    if (req.user.parent) {
      const p = await Parent.findById(req.user.parent).select("student");
      return p?.student;
    }
    const p = await Parent.findOne({ user: req.user._id }).select("student");
    return p?.student;
  }

  return null;
};

// POST /api/outpass
export const createOutpassRequest = async (req, res, next) => {
  try {
    const studentId = await resolveStudentIdForRequest(req);
    if (!studentId) {
      return res.status(400).json({ message: "Student linkage not found for this user" });
    }

    const outpass = await OutpassRequest.create({
      ...req.body,
      student: studentId,
      requestedBy: req.user._id
    });
    res.status(201).json(outpass);
  } catch (err) {
    next(err);
  }
};

// GET /api/outpass
export const getOutpassRequests = async (req, res, next) => {
  try {
    const filter = {
      ...parseDateRange(req, "createdAt")
    };
    if (req.user.role === "parent") filter.requestedBy = req.user._id;
    if (req.user.role === "student") {
      const studentId = await resolveStudentIdForRequest(req);
      if (!studentId) {
        return res.json({ items: [], page: 1, limit: 10, total: 0, totalPages: 0 });
      }
      filter.student = studentId;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.student && !["parent", "student"].includes(req.user.role)) {
      filter.student = req.query.student;
    }

    const { page, limit, skip } = parsePagination(req);
    const sort = parseSort(req);

    const [items, total] = await Promise.all([
      OutpassRequest.find(filter)
        .populate("student requestedBy approvedBy")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      OutpassRequest.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/outpass/:id
export const updateOutpassStatus = async (req, res, next) => {
  try {
    const { status, remarks, actualReturnDateTime } = req.body;
    const outpass = await OutpassRequest.findById(req.params.id).populate("student");
    if (!outpass) return res.status(404).json({ message: "Outpass request not found" });

    outpass.status = status || outpass.status;
    outpass.remarks = remarks || outpass.remarks;
    if (actualReturnDateTime) {
      outpass.actualReturnDateTime = actualReturnDateTime;
    }
    outpass.approvedBy = req.user._id;
    await outpass.save();

    const student = await Student.findById(outpass.student._id).populate("user");
    if (student?.user) {
      await notifyUser({
        user: student.user,
        student: student._id,
        type: "outpass_status",
        title: "Outpass request updated",
        message: `Your outpass status is ${outpass.status}.`,
        channels: ["in_app", "email"]
      });
    }

    res.json(outpass);
  } catch (err) {
    next(err);
  }
};

