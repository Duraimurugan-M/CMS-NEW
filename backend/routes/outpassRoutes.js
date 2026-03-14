import express from "express";
import { body, param } from "express-validator";
import {
  createOutpassRequest,
  getOutpassRequests,
  updateOutpassStatus
} from "../controllers/outpassController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("parent"),
  [body("student").optional().isMongoId(), body("exitDateTime").isISO8601(), body("reason").notEmpty()],
  validate,
  createOutpassRequest
);
router.get("/", authorizeRoles("admin", "superadmin", "staff", "parent", "student"), getOutpassRequests);
router.put(
  "/:id",
  authorizeRoles("admin", "superadmin", "staff"),
  [
    param("id").isMongoId(),
    body("status").optional().isIn(["pending", "approved", "rejected", "completed"]),
    body("actualReturnDateTime").optional().isISO8601()
  ],
  validate,
  updateOutpassStatus
);

export default router;

