import express from "express";
import { body } from "express-validator";
import { createShopItem, getShopItems, createSale, listSales } from "../controllers/shopController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/shop-items",
  authorizeRoles("shopadmin", "canteen", "superadmin"),
  [body("name").notEmpty(), body("price").isFloat({ gt: 0 })],
  validate,
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
  [body("lines").isArray({ min: 1 }), body("lines.*.item").isMongoId(), body("lines.*.quantity").isInt({ min: 1 })],
  validate,
  createSale
);
router.get(
  "/sales",
  authorizeRoles("shopadmin", "canteen", "superadmin", "admin", "accountant"),
  listSales
);

export default router;

