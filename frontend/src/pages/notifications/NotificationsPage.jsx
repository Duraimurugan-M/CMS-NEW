import { useEffect, useState } from "react";
import api from "../../services/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  const load = async () => {
    const res = await api.get("/notifications");
    setNotifications(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await api.post(`/notifications/${id}/read`);
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Notifications</h1>
        <p className="text-xs text-slate-500">
          Automated alerts for fees, leave, outpass, and movements.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {notifications.map((n) => (
          <div key={n._id} className="p-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{n.title}</p>
              <p className="text-xs text-slate-500">
                {new Date(n.createdAt).toLocaleString("en-IN", {
                  dateStyle: "short",
                  timeStyle: "short"
                })}
              </p>
              <p className="text-sm text-slate-700 mt-1">{n.message}</p>
            </div>
            {!n.isRead && (
              <button
                onClick={() => markRead(n._id)}
                className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100"
              >
                Mark read
              </button>
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="p-4 text-xs text-slate-500">No notifications yet.</div>
        )}
      </div>
    </div>
  );
}

