import express from "express";
import { body } from "express-validator";
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
router.put("/:id", authorizeRoles("admin", "superadmin", "accountant"), updateFeeHead);
router.delete("/:id", authorizeRoles("admin", "superadmin", "accountant"), deleteFeeHead);

router.post(
  "/invoices",
  authorizeRoles("admin", "superadmin", "accountant"),
  createInvoice
);

export default router;

