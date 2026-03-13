import Setting from "../models/Setting.js";

const defaults = {
  fine: {
    libraryPerLateDay: 10,
    feePerLateDay: 0
  },
  library: {
    maxActiveIssuesPerStudent: 3
  },
  reminders: {
    feeDueBeforeDays: [3, 1],
    feeDueAfterDays: [1, 3, 7]
  }
};

export const getSettings = async () => {
  const docs = await Setting.find();
  const map = Object.fromEntries(docs.map((d) => [d.key, d.value]));
  return {
    fine: map.fine || defaults.fine,
    library: map.library || defaults.library,
    reminders: map.reminders || defaults.reminders
  };
};

export const upsertSetting = async (key, value) => {
  return Setting.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
};

