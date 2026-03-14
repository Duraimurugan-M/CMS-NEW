import { getLedgerForStudent, addLedgerEntry } from "../services/ledgerService.js";
import { assertStudentAccess } from "../utils/accessUtils.js";

// GET /api/ledger/:studentId
export const getStudentLedger = async (req, res, next) => {
  try {
    const allowed = await assertStudentAccess({ user: req.user, studentId: req.params.studentId });
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed to access this ledger" });
    }

    const ledger = await getLedgerForStudent(req.params.studentId);
    res.json(ledger);
  } catch (err) {
    next(err);
  }
};

// POST /api/ledger/entry
// Manual adjustments (rare; for accountants)
export const addManualEntry = async (req, res, next) => {
  try {
    const { studentId, type, amount, description } = req.body;
    const ledger = await addLedgerEntry({
      studentId,
      type,
      amount,
      description
    });
    res.status(201).json(ledger);
  } catch (err) {
    next(err);
  }
};

