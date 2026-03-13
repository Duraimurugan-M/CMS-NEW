import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getAllSettings, updateSetting } from "../controllers/settingController.js";

const router = express.Router();

router.use(protect);

router.get("/", authorizeRoles("superadmin", "admin"), getAllSettings);
router.put("/:key", authorizeRoles("superadmin"), updateSetting);

export default router;

