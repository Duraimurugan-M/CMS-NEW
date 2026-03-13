import express from "express";
import { createCircular, getCirculars } from "../controllers/circularController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("admin", "superadmin"), createCircular);
router.get("/", getCirculars);

export default router;

