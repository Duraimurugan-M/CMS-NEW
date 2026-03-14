import { useEffect, useState } from "react";
import api from "../../services/api";
import Input from "../../components/forms/Input.jsx";
import Modal from "../../components/modals/Modal.jsx";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [openRun, setOpenRun] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const load = async () => {
    const res = await api.get("/settings");
    setSettings(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const saveKey = async (key, value) => {
    await api.put(`/settings/${key}`, { value });
    load();
  };

  const runReminders = async () => {
    const res = await api.post("/reminders/fees/run");
    setRunResult(res.data);
  };

  if (!settings) return <div className="text-sm text-slate-600">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">System Settings</h1>
          <p className="text-xs text-slate-500">Fine rules, limits, and reminder schedules.</p>
        </div>
        <button
          onClick={() => setOpenRun(true)}
          className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white"
        >
          Run Fee Reminders Now
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <h2 className="text-sm font-semibold text-slate-800">Fine Settings</h2>
          <Input
            label="Library fine per late day (₹)"
            type="number"
            value={settings.fine.libraryPerLateDay}
            onChange={(e) =>
              setSettings((s) => ({ ...s, fine: { ...s.fine, libraryPerLateDay: Number(e.target.value) } }))
            }
          />
          <button
            onClick={() => saveKey("fine", settings.fine)}
            className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white"
          >
            Save Fine Settings
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <h2 className="text-sm font-semibold text-slate-800">Library Limits</h2>
          <Input
            label="Max active issues per student"
            type="number"
            value={settings.library.maxActiveIssuesPerStudent}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                library: { ...s.library, maxActiveIssuesPerStudent: Number(e.target.value) }
              }))
            }
          />
          <button
            onClick={() => saveKey("library", settings.library)}
            className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white"
          >
            Save Library Settings
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 md:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800">Fee Reminder Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Before due days (comma-separated)"
              value={(settings.reminders.feeDueBeforeDays || []).join(",")}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  reminders: {
                    ...s.reminders,
                    feeDueBeforeDays: e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean)
                      .map(Number)
                  }
                }))
              }
            />
            <Input
              label="After due days (comma-separated)"
              value={(settings.reminders.feeDueAfterDays || []).join(",")}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  reminders: {
                    ...s.reminders,
                    feeDueAfterDays: e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean)
                      .map(Number)
                  }
                }))
              }
            />
          </div>
          <button
            onClick={() => saveKey("reminders", settings.reminders)}
            className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white"
          >
            Save Reminder Settings
          </button>
        </div>
      </div>

      <Modal
        open={openRun}
        title="Run fee reminders"
        onClose={() => setOpenRun(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpenRun(false)}
              className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              onClick={runReminders}
              className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white"
            >
              Run
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-700">
          This will send in-app fee reminders based on invoice due dates and the configured schedule.
        </p>
        {runResult && (
          <pre className="text-xs bg-slate-50 border border-slate-200 rounded-md p-3 mt-3 overflow-auto">
{JSON.stringify(runResult, null, 2)}
          </pre>
        )}
      </Modal>
    </div>
  );
}

