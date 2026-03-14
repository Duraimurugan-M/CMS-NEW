import express from "express";
import { body } from "express-validator";
import {
  bootstrapSuperadmin,
  login,
  sendOtp,
  verifyOtp,
  refresh,
  getProfile,
  logout
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/bootstrap",
  [body("name").notEmpty(), body("email").isEmail(), body("password").isLength({ min: 6 })],
  bootstrapSuperadmin
);

router.post(
  "/login",
  [body("email").notEmpty().withMessage("Email or phone is required"), body("password").notEmpty()],
  login
);
router.post("/send-otp", [body("regNo").notEmpty()], sendOtp);
router.post(
  "/verify-otp",
  [body("regNo").notEmpty(), body("phone").notEmpty(), body("code").notEmpty()],
  verifyOtp
);
router.post("/refresh", [body("refreshToken").notEmpty()], refresh);

router.get("/profile", protect, getProfile);
router.post("/logout", protect, logout);

export default router;

