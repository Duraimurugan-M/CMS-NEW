import express from "express";
import { body, param } from "express-validator";
import {
  createPaymentOrder,
  verifyPayment,
  listPayments,
  getStudentPayments,
  getMyPayments
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/create",
  authorizeRoles("student", "parent", "admin", "superadmin", "accountant"),
  [body("studentId").isMongoId(), body("invoiceId").isMongoId(), body("amount").isFloat({ gt: 0 })],
  validate,
  createPaymentOrder
);
router.post(
  "/verify",
  [
    body("paymentId").isMongoId(),
    body("razorpayPaymentId").notEmpty(),
    body("razorpaySignature").notEmpty()
  ],
  validate,
  verifyPayment
);
router.get("/", authorizeRoles("admin", "superadmin", "accountant"), listPayments);
router.get("/mine", authorizeRoles("student", "parent"), getMyPayments);
router.get("/student/:id", [param("id").isMongoId()], validate, getStudentPayments);

export default router;


