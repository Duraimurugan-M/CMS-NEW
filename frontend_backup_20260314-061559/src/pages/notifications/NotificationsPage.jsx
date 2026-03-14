import { useEffect, useState } from "react";
import api from "../../services/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });

  const load = async ({ page = 1 } = {}) => {
    const res = await api.get("/notifications", { params: { page, limit: 20 } });
    setNotifications(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await api.post(`/notifications/${id}/read`);
    load({ page: meta.page });
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
      <div className="pt-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50"
              onClick={() => load({ page: meta.page - 1 })}
              disabled={meta.page <= 1}
            >
              Prev
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50"
              onClick={() => load({ page: meta.page + 1 })}
              disabled={meta.page >= meta.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

