import express from "express";
import { body } from "express-validator";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("admin", "superadmin"),
  [body("firstName").notEmpty(), body("admissionDate").notEmpty()],
  createStudent
);

router.get("/", authorizeRoles("admin", "superadmin", "accountant", "staff"), getStudents);
router.get("/:id", getStudentById);
router.put("/:id", authorizeRoles("admin", "superadmin"), updateStudent);
router.delete("/:id", authorizeRoles("admin", "superadmin"), deleteStudent);

export default router;

