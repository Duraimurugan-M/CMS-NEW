import express from "express";
import { getStudentLedger, addManualEntry } from "../controllers/ledgerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/:studentId", authorizeRoles("admin", "superadmin", "accountant"), getStudentLedger);
router.post("/entry", authorizeRoles("superadmin", "accountant"), addManualEntry);

export default router;

