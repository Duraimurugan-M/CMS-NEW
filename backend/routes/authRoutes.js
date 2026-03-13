import express from "express";
import { body } from "express-validator";
import { bootstrapSuperadmin, login, getProfile, logout } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/bootstrap",
  [body("name").notEmpty(), body("email").isEmail(), body("password").isLength({ min: 6 })],
  bootstrapSuperadmin
);

router.post("/login", [body("password").notEmpty()], login);

router.get("/profile", protect, getProfile);
router.post("/logout", protect, logout);

export default router;

