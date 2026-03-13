import express from "express";
import { createShopItem, getShopItems, createSale } from "../controllers/shopController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/shop-items",
  authorizeRoles("shopadmin", "canteen", "superadmin"),
  createShopItem
);
router.get(
  "/shop-items",
  authorizeRoles("shopadmin", "canteen", "superadmin", "admin"),
  getShopItems
);
router.post(
  "/sales",
  authorizeRoles("shopadmin", "canteen", "superadmin"),
  createSale
);

export default router;

