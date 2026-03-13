import express from "express";
import {
  createOutpassRequest,
  getOutpassRequests,
  updateOutpassStatus
} from "../controllers/outpassController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("parent", "student"), createOutpassRequest);
router.get("/", authorizeRoles("admin", "superadmin", "staff"), getOutpassRequests);
router.put("/:id", authorizeRoles("admin", "superadmin", "staff"), updateOutpassStatus);

export default router;

