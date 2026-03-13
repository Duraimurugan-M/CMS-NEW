import express from "express";
import { body, param } from "express-validator";
import {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem
} from "../controllers/inventoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("admin", "superadmin", "accountant"),
  [body("name").notEmpty(), body("category").isIn(["academic", "hostel", "general"])],
  validate,
  createInventoryItem
);
router.get("/", authorizeRoles("admin", "superadmin", "accountant"), getInventoryItems);
router.put(
  "/:id",
  authorizeRoles("admin", "superadmin", "accountant"),
  [param("id").isMongoId()],
  validate,
  updateInventoryItem
);

export default router;

