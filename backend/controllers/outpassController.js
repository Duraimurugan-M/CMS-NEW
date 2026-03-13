import OutpassRequest from "../models/OutpassRequest.js";
import Student from "../models/Student.js";
import { notifyUser } from "../services/notificationService.js";

// POST /api/outpass
export const createOutpassRequest = async (req, res, next) => {
  try {
    const outpass = await OutpassRequest.create({
      ...req.body,
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
    const items = await OutpassRequest.find().populate("student requestedBy approvedBy");
    res.json(items);
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

