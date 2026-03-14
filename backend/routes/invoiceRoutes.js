import express from "express";
import { param } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { listInvoices, listMyInvoices, listStudentInvoices } from "../controllers/invoiceController.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", authorizeRoles("admin", "superadmin", "accountant"), listInvoices);
router.get("/mine", authorizeRoles("student", "parent"), listMyInvoices);
router.get(
  "/student/:id",
  authorizeRoles("admin", "superadmin", "accountant", "student", "parent"),
  [param("id").isMongoId()],
  validate,
  listStudentInvoices
);

export default router;

