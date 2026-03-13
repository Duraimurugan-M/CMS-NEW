import CheckInLog from "../models/CheckInLog.js";
import Student from "../models/Student.js";
import { notifyUser } from "../services/notificationService.js";

// POST /api/checkin
export const createCheckInLog = async (req, res, next) => {
  try {
    const { studentId, type, location } = req.body;
    const log = await CheckInLog.create({
      student: studentId,
      type,
      location,
      recordedBy: req.user._id
    });

    // Notify linked parent/student user if any (basic implementation)
    const student = await Student.findById(studentId).populate("user");
    if (student?.user) {
      await notifyUser({
        user: student.user,
        student: student._id,
        type: "checkin_alert",
        title: `Student ${type}`,
        message: `Student ${student.firstName} ${student.lastName || ""} ${type} at ${location}.`,
        channels: ["in_app"]
      });
    }

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

// GET /api/checkin/student/:id
export const getStudentCheckIns = async (req, res, next) => {
  try {
    const logs = await CheckInLog.find({ student: req.params.id }).sort("-timestamp");
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

