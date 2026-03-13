import dayjs from "dayjs";
import Ledger from "../models/Ledger.js";

export const ensureLedgerForStudent = async (studentId, { session } = {}) => {
  let ledger = await Ledger.findOne({ student: studentId }).session(session || null);
  if (!ledger) {
    const created = await Ledger.create([{ student: studentId, entries: [] }], { session });
    ledger = created[0];
  }
  return ledger;
};

export const addLedgerEntry = async ({
  studentId,
  type,
  amount,
  description,
  invoiceId,
  paymentId,
  session
}) => {
  const ledger = await ensureLedgerForStudent(studentId, { session });
  const lastEntry = ledger.entries[ledger.entries.length - 1];
  const prevBalance = lastEntry ? lastEntry.balanceAfter : 0;
  const newBalance = type === "debit" ? prevBalance + amount : prevBalance - amount;

  ledger.entries.push({
    type,
    date: dayjs().toDate(),
    description,
    invoice: invoiceId,
    payment: paymentId,
    amount,
    balanceAfter: newBalance
  });

  await ledger.save({ session });
  return ledger;
};

export const getLedgerForStudent = async (studentId) => {
  const ledger = await ensureLedgerForStudent(studentId);
  return ledger;
};

