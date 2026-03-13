import express from "express";
import { body, param } from "express-validator";
import {
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveStatus
} from "../controllers/leaveController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("parent", "student"),
  [
    body("student").isMongoId(),
    body("fromDate").isISO8601(),
    body("toDate").isISO8601(),
    body("reason").notEmpty()
  ],
  validate,
  createLeaveRequest
);
router.get("/", authorizeRoles("admin", "superadmin", "staff", "parent", "student"), getLeaveRequests);
router.put(
  "/:id",
  authorizeRoles("admin", "superadmin", "staff"),
  [param("id").isMongoId(), body("status").optional().isIn(["pending", "approved", "rejected"])],
  validate,
  updateLeaveStatus
);

export default router;

