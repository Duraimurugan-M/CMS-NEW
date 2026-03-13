import express from "express";
import {
  createCheckInLog,
  getStudentCheckIns
} from "../controllers/checkInController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("staff", "admin", "superadmin"),
  createCheckInLog
);

router.get(
  "/student/:id",
  authorizeRoles("staff", "admin", "superadmin"),
  getStudentCheckIns
);

export default router;

