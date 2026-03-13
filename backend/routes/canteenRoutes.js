// Canteen endpoints are shared with shop via flags; this file can host canteen-specific aliases if needed.
import express from "express";
import { createShopItem, getShopItems, createSale } from "../controllers/shopController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/menu",
  authorizeRoles("canteen", "superadmin"),
  (req, res, next) => {
    req.body.isCanteen = true;
    return createShopItem(req, res, next);
  }
);

router.get(
  "/menu",
  authorizeRoles("canteen", "superadmin", "admin"),
  (req, res, next) => {
    req.query.isCanteen = "true";
    return getShopItems(req, res, next);
  }
);

router.post(
  "/orders",
  authorizeRoles("canteen", "superadmin"),
  (req, res, next) => {
    req.body.isCanteen = true;
    return createSale(req, res, next);
  }
);

export default router;

