import { useEffect, useState } from "react";
import api from "../../services/api";

export default function CircularsPage() {
  const [circulars, setCirculars] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    api.get("/circulars", { params: { page: 1, limit: 10 } }).then((res) => {
      setCirculars(res.data.items);
      setMeta({ page: res.data.page, totalPages: res.data.totalPages });
    });
  }, []);

  const load = async (page) => {
    const res = await api.get("/circulars", { params: { page, limit: 10 } });
    setCirculars(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Circulars & Announcements</h1>
        <p className="text-xs text-slate-500">
          View published exam schedules, events, and important notices.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {circulars.map((c) => (
          <div key={c._id} className="p-4">
            <h2 className="text-sm font-semibold text-slate-900">{c.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(c.publishDate).toLocaleString("en-IN", {
                dateStyle: "medium"
              })}
            </p>
            <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">{c.content}</p>
          </div>
        ))}
        {circulars.length === 0 && (
          <div className="p-4 text-xs text-slate-500">No circulars available.</div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Page {meta.page} of {meta.totalPages}
        </p>
        <div className="flex gap-2">
          <button
            className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50"
            onClick={() => load(meta.page - 1)}
            disabled={meta.page <= 1}
          >
            Prev
          </button>
          <button
            className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50"
            onClick={() => load(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

