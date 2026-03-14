import CheckInLog from "../models/CheckInLog.js";
import Student from "../models/Student.js";
import Parent from "../models/Parent.js";
import User from "../models/User.js";
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

    // Notify linked student, parents, and staff/admin users.
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

    const parents = await Parent.find({ student: studentId }).populate("user");
    await Promise.all(
      parents
        .filter((parent) => parent.user)
        .map((parent) =>
          notifyUser({
            user: parent.user,
            student: student._id,
            type: "checkin_alert",
            title: `Student ${type}`,
            message: `Student ${student.firstName} ${student.lastName || ""} ${type} at ${location}.`,
            channels: ["in_app", "email"]
          })
        )
    );

    const staffUsers = await User.find({ role: { $in: ["staff", "admin", "superadmin"] }, isActive: true }).select("_id email phone");
    await Promise.all(
      staffUsers
        .filter((staffUser) => String(staffUser._id) !== String(req.user._id))
        .map((staffUser) =>
          notifyUser({
            user: staffUser,
            student: student._id,
            type: "checkin_alert",
            title: `Movement alert for ${student.regNumber}`,
            message: `${student.firstName} ${student.lastName || ""} ${type} at ${location}.`,
            channels: ["in_app"]
          })
        )
    );

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

