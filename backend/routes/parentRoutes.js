import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { listParents } from "../controllers/parentController.js";

const router = express.Router();

router.use(protect);
router.get("/", authorizeRoles("superadmin", "admin"), listParents);

export default router;
