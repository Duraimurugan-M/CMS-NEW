import express from "express";
import { body, param } from "express-validator";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("admin", "superadmin"),
  [body("firstName").notEmpty(), body("admissionDate").notEmpty()],
  validate,
  createStudent
);

router.get("/", authorizeRoles("admin", "superadmin", "accountant", "staff"), getStudents);
router.get("/:id", [param("id").isMongoId()], validate, getStudentById);
router.put(
  "/:id",
  authorizeRoles("admin", "superadmin"),
  [param("id").isMongoId()],
  validate,
  updateStudent
);
router.delete(
  "/:id",
  authorizeRoles("admin", "superadmin"),
  [param("id").isMongoId()],
  validate,
  deleteStudent
);

export default router;

