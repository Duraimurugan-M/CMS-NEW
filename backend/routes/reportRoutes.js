import express from "express";
import {
  getFeeReport,
  getInventoryReport,
  getExpenseReport,
  getCanteenShopReport
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/fees", authorizeRoles("admin", "superadmin", "accountant"), getFeeReport);
router.get("/inventory", authorizeRoles("admin", "superadmin"), getInventoryReport);
router.get("/expenses", authorizeRoles("admin", "superadmin", "accountant"), getExpenseReport);
router.get(
  "/canteen-shop",
  authorizeRoles("admin", "superadmin", "accountant"),
  getCanteenShopReport
);

export default router;

