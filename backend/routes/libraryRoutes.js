import express from "express";
import {
  createBook,
  getBooks,
  issueBook,
  returnBook
} from "../controllers/libraryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/books", authorizeRoles("librarian", "superadmin"), createBook);
router.get("/books", authorizeRoles("librarian", "superadmin", "admin"), getBooks);
router.post("/issue-book", authorizeRoles("librarian", "superadmin"), issueBook);
router.post("/return-book", authorizeRoles("librarian", "superadmin"), returnBook);

export default router;

