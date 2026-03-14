import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

function MetricCard({ label, value, tone = "text-slate-900" }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuthStore();
  const [feeSummary, setFeeSummary] = useState(null);
  const [studentsCount, setStudentsCount] = useState(0);
  const [inventoryAlerts, setInventoryAlerts] = useState(0);
  const [unread, setUnread] = useState(0);
  const [librarySummary, setLibrarySummary] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);

  useEffect(() => {
    if (!user) return;

    api.get("/notifications/unread-count").then((res) => setUnread(res.data.unread || 0)).catch(() => {});

    if (["admin", "superadmin", "accountant", "staff"].includes(user.role)) {
      api.get("/students", { params: { page: 1, limit: 1 } }).then((res) => setStudentsCount(res.data.total || 0)).catch(() => {});
    }

    if (["admin", "superadmin", "accountant"].includes(user.role)) {
      api.get("/reports/fees").then((res) => setFeeSummary(res.data)).catch(() => {});
      api.get("/reports/inventory").then((res) => setInventoryAlerts(res.data.lowStockCount || 0)).catch(() => {});
    }

    if (["librarian", "superadmin", "admin"].includes(user.role)) {
      api.get("/reports/library").then((res) => setLibrarySummary(res.data)).catch(() => {});
    }

    if (["shopadmin", "canteen", "superadmin", "admin", "accountant"].includes(user.role)) {
      api.get("/reports/canteen-shop").then((res) => setSalesSummary(res.data)).catch(() => {});
    }
  }, [user]);

  const chartData = useMemo(
    () =>
      feeSummary
        ? [
            { name: "Billed", value: feeSummary.totalBilled || 0 },
            { name: "Collected", value: feeSummary.totalCollected || 0 },
            { name: "Pending", value: feeSummary.totalPending || 0 }
          ]
        : [],
    [feeSummary]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
        <p className="text-sm text-slate-600">Role: {user?.role}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Students" value={studentsCount} />
        <MetricCard label="Unread Notifications" value={unread} tone="text-primary-700" />
        {["admin", "superadmin", "accountant"].includes(user?.role) && (
          <MetricCard label="Pending Dues" value={`Rs ${feeSummary?.totalPending?.toLocaleString() || 0}`} tone="text-amber-700" />
        )}
        {["admin", "superadmin", "accountant"].includes(user?.role) && (
          <MetricCard label="Inventory Alerts" value={inventoryAlerts} tone="text-rose-700" />
        )}
        {["librarian", "superadmin", "admin"].includes(user?.role) && (
          <MetricCard label="Active Book Issues" value={librarySummary?.activeIssues || 0} tone="text-sky-700" />
        )}
        {["shopadmin", "canteen", "superadmin", "admin", "accountant"].includes(user?.role) && (
          <MetricCard label="Shop Sales" value={`Rs ${salesSummary?.totalShop || 0}`} tone="text-emerald-700" />
        )}
      </div>

      {["admin", "superadmin", "accountant"].includes(user?.role) && (
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
      )}
    </div>
  );
}
