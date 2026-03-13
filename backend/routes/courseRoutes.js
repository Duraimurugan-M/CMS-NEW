import express from "express";
import { body, param } from "express-validator";
import {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("admin", "superadmin"),
  [body("name").notEmpty(), body("code").notEmpty()],
  validate,
  createCourse
);

router.get("/", getCourses);
router.put(
  "/:id",
  authorizeRoles("admin", "superadmin"),
  [param("id").isMongoId()],
  validate,
  updateCourse
);
router.delete(
  "/:id",
  authorizeRoles("admin", "superadmin"),
  [param("id").isMongoId()],
  validate,
  deleteCourse
);

export default router;

