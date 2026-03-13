import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  listPayments,
  getStudentPayments
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/create",
  authorizeRoles("student", "admin", "superadmin", "accountant"),
  createPaymentOrder
);
router.post("/verify", verifyPayment);
router.get("/", authorizeRoles("admin", "superadmin", "accountant"), listPayments);
router.get("/student/:id", getStudentPayments);

export default router;


