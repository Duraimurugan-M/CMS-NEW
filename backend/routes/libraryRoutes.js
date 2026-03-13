import express from "express";
import {
  createBook,
  getBooks,
  issueBook,
  returnBook,
  getIssueHistory
} from "../controllers/libraryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/books", authorizeRoles("librarian", "superadmin"), createBook);
router.get("/books", authorizeRoles("librarian", "superadmin", "admin"), getBooks);
router.post("/issue-book", authorizeRoles("librarian", "superadmin"), issueBook);
router.post("/return-book", authorizeRoles("librarian", "superadmin"), returnBook);
router.get("/issues", authorizeRoles("librarian", "superadmin", "admin"), getIssueHistory);

export default router;

