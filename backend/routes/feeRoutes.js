import express from "express";
import { body, param } from "express-validator";
import {
  createFeeHead,
  getFeeHeads,
  updateFeeHead,
  deleteFeeHead,
  createInvoice
} from "../controllers/feeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("admin", "superadmin", "accountant"),
  [body("name").notEmpty(), body("code").notEmpty()],
  validate,
  createFeeHead
);

router.get("/", getFeeHeads);
router.put(
  "/:id",
  authorizeRoles("admin", "superadmin", "accountant"),
  [param("id").isMongoId()],
  validate,
  updateFeeHead
);
router.delete(
  "/:id",
  authorizeRoles("admin", "superadmin", "accountant"),
  [param("id").isMongoId()],
  validate,
  deleteFeeHead
);

router.post(
  "/invoices",
  authorizeRoles("admin", "superadmin", "accountant"),
  [
    body("student").isMongoId(),
    body("lines").isArray({ min: 1 }),
    body("lines.*.feeHead").isMongoId(),
    body("lines.*.amount").isFloat({ gt: 0 })
  ],
  validate,
  createInvoice
);

export default router;

