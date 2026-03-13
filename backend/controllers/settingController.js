import { getSettings, upsertSetting } from "../services/settingService.js";

// GET /api/settings
export const getAllSettings = async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings/:key
export const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const doc = await upsertSetting(key, req.body.value);
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

