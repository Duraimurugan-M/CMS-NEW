import express from "express";
import { body } from "express-validator";
import {
  createBook,
  getBooks,
  issueBook,
  returnBook,
  getIssueHistory
} from "../controllers/libraryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/books",
  authorizeRoles("librarian", "superadmin"),
  [body("title").notEmpty(), body("totalCopies").optional().isInt({ min: 1 })],
  validate,
  createBook
);
router.get("/books", authorizeRoles("librarian", "superadmin", "admin"), getBooks);
router.post(
  "/issue-book",
  authorizeRoles("librarian", "superadmin"),
  [body("bookId").isMongoId(), body("studentId").isMongoId(), body("dueDate").isISO8601()],
  validate,
  issueBook
);
router.post(
  "/return-book",
  authorizeRoles("librarian", "superadmin"),
  [body("issueId").isMongoId()],
  validate,
  returnBook
);
router.get("/issues", authorizeRoles("librarian", "superadmin", "admin"), getIssueHistory);

export default router;

