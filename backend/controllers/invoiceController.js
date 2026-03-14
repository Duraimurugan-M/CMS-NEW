import Invoice from "../models/Invoice.js";
import { parsePagination, parseSort, parseDateRange } from "../utils/queryUtils.js";
import { assertStudentAccess, isPrivilegedRole, resolveLinkedStudentId } from "../utils/accessUtils.js";

// GET /api/invoices
export const listInvoices = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const sort = parseSort(req);

    const filter = {
      ...parseDateRange(req, "issueDate")
    };

    if (req.query.student) filter.student = req.query.student;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.isAdvance !== undefined) filter.isAdvance = req.query.isAdvance === "true";

    const [items, total] = await Promise.all([
      Invoice.find(filter).populate("student").sort(sort).skip(skip).limit(limit),
      Invoice.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices/student/:id
export const listStudentInvoices = async (req, res, next) => {
  try {
    const allowed = await assertStudentAccess({ user: req.user, studentId: req.params.id });
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed to access these invoices" });
    }

    const { page, limit, skip } = parsePagination(req);
    const sort = parseSort(req, "-issueDate");
    const filter = { student: req.params.id };

    const [items, total] = await Promise.all([
      Invoice.find(filter).sort(sort).skip(skip).limit(limit),
      Invoice.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

export const listMyInvoices = async (req, res, next) => {
  try {
    if (isPrivilegedRole(req.user.role)) {
      return listInvoices(req, res, next);
    }

    const studentId = await resolveLinkedStudentId(req.user);
    if (!studentId) {
      return res.json({ items: [], page: 1, limit: 20, total: 0, totalPages: 0 });
    }

    req.params.id = studentId;
    return listStudentInvoices(req, res, next);
  } catch (err) {
    next(err);
  }
};

