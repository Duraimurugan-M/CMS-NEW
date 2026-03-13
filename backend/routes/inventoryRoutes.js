import express from "express";
import {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem
} from "../controllers/inventoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("admin", "superadmin", "accountant"), createInventoryItem);
router.get("/", authorizeRoles("admin", "superadmin", "accountant"), getInventoryItems);
router.put("/:id", authorizeRoles("admin", "superadmin", "accountant"), updateInventoryItem);

export default router;

