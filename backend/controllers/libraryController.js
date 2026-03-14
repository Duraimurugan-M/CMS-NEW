import Book from "../models/Book.js";
import BookIssue from "../models/BookIssue.js";
import dayjs from "dayjs";
import { getSettings } from "../services/settingService.js";
import { parsePagination, parseSort } from "../utils/queryUtils.js";
import { addLedgerEntry } from "../services/ledgerService.js";

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
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(String(req.query.search), "i") },
        { author: new RegExp(String(req.query.search), "i") },
        { isbn: new RegExp(String(req.query.search), "i") }
      ];
    }
    if (req.query.category) filter.category = req.query.category;

    const { page, limit, skip } = parsePagination(req);
    const sort = parseSort(req);

    const [items, total] = await Promise.all([
      Book.find(filter).sort(sort).skip(skip).limit(limit),
      Book.countDocuments(filter)
    ]);
    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/library/issues
export const getIssueHistory = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.book) filter.book = req.query.book;
    if (req.query.active === "true") filter.returnDate = { $exists: false };

    const { page, limit, skip } = parsePagination(req);
    const sort = parseSort(req);

    const [items, total] = await Promise.all([
      BookIssue.find(filter).populate("book student").sort(sort).skip(skip).limit(limit),
      BookIssue.countDocuments(filter)
    ]);
    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
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

    const settings = await getSettings();
    const activeIssuesCount = await BookIssue.countDocuments({
      student: studentId,
      returnDate: { $exists: false }
    });
    if (activeIssuesCount >= settings.library.maxActiveIssuesPerStudent) {
      return res.status(400).json({
        message: `Max books limit reached (${settings.library.maxActiveIssuesPerStudent})`
      });
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

    const settings = await getSettings();
    // Fine per day late (configurable)
    const lateDays = Math.max(0, dayjs(issue.returnDate).diff(issue.dueDate, "day"));
    issue.fineAmount = lateDays * Number(settings.fine.libraryPerLateDay || 0);
    await issue.save();

    const book = await Book.findById(issue.book._id);
    book.availableCopies += 1;
    await book.save();

    if (issue.fineAmount > 0) {
      await addLedgerEntry({
        studentId: issue.student,
        type: "debit",
        amount: issue.fineAmount,
        description: `Library fine for delayed return of ${issue.book.title}`
      });
    }

    res.json(issue);
  } catch (err) {
    next(err);
  }
};

