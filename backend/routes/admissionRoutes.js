import express from "express";
import { body, param } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  listAdmissions,
  createAdmission,
  approveAdmission,
  rejectAdmission
} from "../controllers/admissionController.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin", "superadmin", "admission"));

router.get("/", listAdmissions);
router.post(
  "/",
  [
    body("firstName").notEmpty(),
    body("admissionDate").notEmpty(),
    body("course").notEmpty(),
    body("statusType").optional().isIn(["temporary", "permanent"]),
  ],
  validate,
  createAdmission
);

router.put(
  "/:id/approve",
  [param("id").isMongoId()],
  validate,
  approveAdmission
);

router.put(
  "/:id/reject",
  [param("id").isMongoId()],
  validate,
  rejectAdmission
);

export default router;
