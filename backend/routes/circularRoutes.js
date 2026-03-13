import express from "express";
import { body, param } from "express-validator";
import {
  createCircular,
  getCirculars,
  updateCircular,
  deleteCircular
} from "../controllers/circularController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("admin", "superadmin"),
  [body("title").notEmpty(), body("content").notEmpty()],
  validate,
  createCircular
);
router.get("/", getCirculars);
router.put(
  "/:id",
  authorizeRoles("admin", "superadmin"),
  [param("id").isMongoId()],
  validate,
  updateCircular
);
router.delete(
  "/:id",
  authorizeRoles("admin", "superadmin"),
  [param("id").isMongoId()],
  validate,
  deleteCircular
);

export default router;

