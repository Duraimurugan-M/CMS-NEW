import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { runFeeDueReminders } from "../controllers/reminderController.js";

const router = express.Router();

router.use(protect);

router.post("/fees/run", authorizeRoles("superadmin", "admin", "accountant"), runFeeDueReminders);

export default router;

