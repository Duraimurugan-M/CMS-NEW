import dayjs from "dayjs";
import Invoice from "../models/Invoice.js";
import Student from "../models/Student.js";
import ReminderLog from "../models/ReminderLog.js";
import { getSettings } from "./settingService.js";
import { notifyUser } from "./notificationService.js";

export const runFeeDueRemindersJob = async () => {
  const settings = await getSettings();
  const beforeDays = settings.reminders.feeDueBeforeDays || [];
  const afterDays = settings.reminders.feeDueAfterDays || [];

  const today = dayjs().startOf("day");
  const offsets = Array.from(
    new Set([0, ...beforeDays.map((d) => -Number(d)), ...afterDays.map((d) => Number(d))])
  );

  let processed = 0;
  let sent = 0;
  const errors = [];

  for (const offset of offsets) {
    const target = today.add(offset, "day");
    const start = target.startOf("day").toDate();
    const end = target.endOf("day").toDate();

    const invoices = await Invoice.find({
      status: { $in: ["unpaid", "partially_paid"] },
      dueDate: { $gte: start, $lte: end }
    });

    for (const inv of invoices) {
      processed += 1;
      try {
        await ReminderLog.create({
          kind: "fee_due",
          invoice: inv._id,
          student: inv.student,
          dayOffset: offset
        });

        const student = await Student.findById(inv.student).populate("user");
        if (student?.user) {
          await notifyUser({
            user: student.user,
            student: student._id,
            type: "fee_reminder",
            title: offset === 0 ? "Fee due today" : offset < 0 ? "Upcoming fee due" : "Fee overdue",
            message:
              offset === 0
                ? `Invoice ${inv.invoiceNo} is due today. Pending: Rs ${inv.totalAmount - inv.paidAmount}.`
                : offset < 0
                  ? `Invoice ${inv.invoiceNo} is due on ${dayjs(inv.dueDate).format("DD/MM/YYYY")}. Pending: Rs ${inv.totalAmount - inv.paidAmount}.`
                  : `Invoice ${inv.invoiceNo} is overdue since ${dayjs(inv.dueDate).format("DD/MM/YYYY")}. Pending: Rs ${inv.totalAmount - inv.paidAmount}.`,
            channels: ["in_app"]
          });
          sent += 1;
        }
      } catch (e) {
        if (e?.code === 11000) continue;
        errors.push(e.message || String(e));
      }
    }
  }

  return { processed, sent, errors };
};

export const startReminderScheduler = () => {
  const intervalHours = Math.max(1, Number(process.env.REMINDER_INTERVAL_HOURS || 24));
  const intervalMs = intervalHours * 60 * 60 * 1000;

  setInterval(async () => {
    try {
      await runFeeDueRemindersJob();
    } catch (err) {
      console.error("Reminder scheduler failed:", err.message);
    }
  }, intervalMs);
};
