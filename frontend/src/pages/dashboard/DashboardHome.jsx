import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function DashboardHome() {
  const { user } = useAuthStore();
  const [feeSummary, setFeeSummary] = useState(null);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "superadmin" || user.role === "accountant")) {
      api
        .get("/reports/fees")
        .then((res) => setFeeSummary(res.data))
        .catch(() => {});
    }
  }, [user]);

  const chartData = feeSummary
    ? [
        { name: "Billed", value: feeSummary.totalBilled },
        { name: "Collected", value: feeSummary.totalCollected },
        { name: "Pending", value: feeSummary.totalPending }
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
        <p className="text-sm text-slate-600">
          Quick overview of institutional operations and finance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Total Billed</p>
          <p className="text-lg font-semibold text-slate-900">
            ₹ {feeSummary?.totalBilled?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Total Collected</p>
          <p className="text-lg font-semibold text-emerald-700">
            ₹ {feeSummary?.totalCollected?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Pending Dues</p>
          <p className="text-lg font-semibold text-amber-700">
            ₹ {feeSummary?.totalPending?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 h-72">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Fee Summary</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

