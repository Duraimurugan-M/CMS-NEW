import express from "express";
import { body } from "express-validator";
import { createExpense, getExpenses } from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("accountant", "superadmin"),
  [
    body("category").notEmpty(),
    body("description").notEmpty(),
    body("amount").isFloat({ gt: 0 }),
    body("expenseDate").isISO8601()
  ],
  validate,
  createExpense
);
router.get("/", authorizeRoles("accountant", "superadmin", "admin"), getExpenses);

export default router;

