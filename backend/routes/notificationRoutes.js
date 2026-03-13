import express from "express";
import {
  getMyNotifications,
  markNotificationRead,
  getUnreadCount
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/unread-count", getUnreadCount);
router.get("/", getMyNotifications);
router.post("/:id/read", markNotificationRead);

export default router;

