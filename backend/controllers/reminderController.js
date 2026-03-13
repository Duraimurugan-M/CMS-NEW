import { runFeeDueRemindersJob } from "../services/reminderService.js";

// POST /api/reminders/fees/run
export const runFeeDueReminders = async (req, res, next) => {
  try {
    const result = await runFeeDueRemindersJob();
    res.json(result);
  } catch (err) {
    next(err);
  }
};
