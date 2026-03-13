import LeaveRequest from "../models/LeaveRequest.js";
import Student from "../models/Student.js";
import { notifyUser } from "../services/notificationService.js";

// POST /api/leave
export const createLeaveRequest = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.create({
      ...req.body,
      requestedBy: req.user._id
    });
    res.status(201).json(leave);
  } catch (err) {
    next(err);
  }
};

// GET /api/leave
export const getLeaveRequests = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find().populate("student requestedBy reviewedBy");
    res.json(leaves);
  } catch (err) {
    next(err);
  }
};

// PUT /api/leave/:id
export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const leave = await LeaveRequest.findById(req.params.id).populate("student");
    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    leave.status = status || leave.status;
    leave.remarks = remarks || leave.remarks;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    const student = await Student.findById(leave.student._id).populate("user");
    if (student?.user) {
      await notifyUser({
        user: student.user,
        student: student._id,
        type: "leave_status",
        title: "Leave request updated",
        message: `Your leave request is ${leave.status}.`,
        channels: ["in_app", "email"]
      });
    }

    res.json(leave);
  } catch (err) {
    next(err);
  }
};

