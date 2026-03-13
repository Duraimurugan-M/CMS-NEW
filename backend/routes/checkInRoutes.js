import express from "express";
import { body, param } from "express-validator";
import {
  createCheckInLog,
  getStudentCheckIns
} from "../controllers/checkInController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("staff", "admin", "superadmin"),
  [
    body("studentId").isMongoId(),
    body("type").isIn(["checkin", "checkout"]),
    body("location").optional().isIn(["hostel", "gate", "library", "other"])
  ],
  validate,
  createCheckInLog
);

router.get(
  "/student/:id",
  authorizeRoles("staff", "admin", "superadmin"),
  [param("id").isMongoId()],
  validate,
  getStudentCheckIns
);

export default router;

