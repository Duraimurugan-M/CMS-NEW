import express from "express";
import {
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveStatus
} from "../controllers/leaveController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("parent", "student"), createLeaveRequest);
router.get("/", authorizeRoles("admin", "superadmin", "staff"), getLeaveRequests);
router.put("/:id", authorizeRoles("admin", "superadmin", "staff"), updateLeaveStatus);

export default router;

