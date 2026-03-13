import express from "express";
import { body } from "express-validator";
import {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("admin", "superadmin"),
  [body("name").notEmpty(), body("code").notEmpty()],
  createCourse
);

router.get("/", getCourses);
router.put("/:id", authorizeRoles("admin", "superadmin"), updateCourse);
router.delete("/:id", authorizeRoles("admin", "superadmin"), deleteCourse);

export default router;

