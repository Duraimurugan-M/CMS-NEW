import Book from "../models/Book.js";
import BookIssue from "../models/BookIssue.js";
import dayjs from "dayjs";

// POST /api/library/books
export const createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

// GET /api/library/books
export const getBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    next(err);
  }
};

// POST /api/library/issue-book
export const issueBook = async (req, res, next) => {
  try {
    const { bookId, studentId, dueDate } = req.body;
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: "Book not available" });
    }

    const issue = await BookIssue.create({
      book: bookId,
      student: studentId,
      issuedBy: req.user._id,
      issueDate: dayjs().toDate(),
      dueDate
    });

    book.availableCopies -= 1;
    await book.save();

    res.status(201).json(issue);
  } catch (err) {
    next(err);
  }
};

// POST /api/library/return-book
export const returnBook = async (req, res, next) => {
  try {
    const { issueId } = req.body;
    const issue = await BookIssue.findById(issueId).populate("book");
    if (!issue) return res.status(404).json({ message: "Issue record not found" });

    if (issue.returnDate) {
      return res.status(400).json({ message: "Book already returned" });
    }

    issue.returnDate = dayjs().toDate();

    // Simple fine: Rs.10 per day late
    const lateDays = Math.max(0, dayjs(issue.returnDate).diff(issue.dueDate, "day"));
    issue.fineAmount = lateDays * 10;
    await issue.save();

    const book = await Book.findById(issue.book._id);
    book.availableCopies += 1;
    await book.save();

    res.json(issue);
  } catch (err) {
    next(err);
  }
};

