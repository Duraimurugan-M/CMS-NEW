import { useEffect, useState } from "react";
import api from "../../services/api";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/students", { params: { search } });
    setStudents(res.data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Students</h1>
          <p className="text-xs text-slate-500">
            Manage student profiles, admission details, and course allocation.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Search by name or Reg No"
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={load}
            className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white"
          >
            Filter
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left">Reg No</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Course</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b last:border-0 border-slate-100">
                <td className="px-3 py-2">{s.regNo}</td>
                <td className="px-3 py-2">
                  {s.firstName} {s.lastName}
                </td>
                <td className="px-3 py-2">{s.course?.name || "-"}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs">
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-xs text-slate-500" colSpan={4}>
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

