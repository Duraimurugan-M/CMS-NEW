import express from "express";
import { createExpense, getExpenses } from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("accountant", "superadmin"), createExpense);
router.get("/", authorizeRoles("accountant", "superadmin", "admin"), getExpenses);

export default router;

