import express from "express";
import { body, param } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  listUsers,
  createUser,
  updateUser,
  resetUserPassword
} from "../controllers/userController.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("superadmin"));

router.get("/", listUsers);
router.post(
  "/",
  [
    body("name").notEmpty(),
    body("email").optional({ values: "falsy" }).isEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn([
      "superadmin",
      "admin",
      "admission",
      "accountant",
      "student",
      "parent",
      "staff",
      "librarian",
      "shopadmin",
      "canteen"
    ])
  ],
  validate,
  createUser
);
router.put("/:id", [param("id").isMongoId()], validate, updateUser);
router.put(
  "/:id/password",
  [param("id").isMongoId(), body("password").isLength({ min: 6 })],
  validate,
  resetUserPassword
);

export default router;
