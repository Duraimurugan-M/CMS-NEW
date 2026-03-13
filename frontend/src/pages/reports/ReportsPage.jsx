import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import jsPDF from "jspdf";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import GlobalFilters from "../../components/utils/GlobalFilters.jsx";
import Table from "../../components/tables/Table.jsx";

const COLORS = ["#1d4ed8", "#059669", "#f59e0b", "#dc2626", "#0ea5e9"];

export default function ReportsPage() {
  const [feeReport, setFeeReport] = useState(null);
  const [expenseReport, setExpenseReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [canteenReport, setCanteenReport] = useState(null);
  const [libraryReport, setLibraryReport] = useState(null);
  const [pendingDues, setPendingDues] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const load = async () => {
    const params = {
      from: dateRange.from || undefined,
      to: dateRange.to || undefined
    };

    const [fees, expenses, inventory, canteen, library, dues] = await Promise.all([
      api.get("/reports/fees", { params }),
      api.get("/reports/expenses", { params }),
      api.get("/reports/inventory"),
      api.get("/reports/canteen-shop", { params }),
      api.get("/reports/library", { params }),
      api.get("/reports/pending-dues", { params: { ...params, status: status || undefined, search: search || undefined } })
    ]);

    setFeeReport(fees.data);
    setExpenseReport(expenses.data);
    setInventoryReport(inventory.data);
    setCanteenReport(canteen.data);
    setLibraryReport(library.data);
    setPendingDues(dues.data.items || []);
  };

  useEffect(() => {
    load();
  }, []);

  const feeChart = useMemo(
    () =>
      feeReport
        ? [
            { name: "Billed", value: feeReport.totalBilled || 0 },
            { name: "Collected", value: feeReport.totalCollected || 0 },
            { name: "Pending", value: feeReport.totalPending || 0 }
          ]
        : [],
    [feeReport]
  );

  const expenseCategoryChart = useMemo(() => {
    if (!expenseReport?.byCategory) return [];
    return Object.entries(expenseReport.byCategory).map(([name, value]) => ({ name, value }));
  }, [expenseReport]);

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("CMS Reports Snapshot", 10, 12);
    doc.setFontSize(10);
    doc.text(`Fee Billed: Rs ${feeReport?.totalBilled || 0}`, 10, 24);
    doc.text(`Fee Collected: Rs ${feeReport?.totalCollected || 0}`, 10, 30);
    doc.text(`Fee Pending: Rs ${feeReport?.totalPending || 0}`, 10, 36);
    doc.text(`Expenses: Rs ${expenseReport?.total || 0}`, 10, 42);
    doc.text(`Canteen Sales: Rs ${canteenReport?.totalCanteen || 0}`, 10, 48);
    doc.text(`Shop Sales: Rs ${canteenReport?.totalShop || 0}`, 10, 54);
    doc.text(`Library Fines: Rs ${libraryReport?.totalFines || 0}`, 10, 60);
    doc.save("cms-reports.pdf");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Reports & Analytics</h1>
          <p className="text-xs text-slate-500">Fee collection, dues, inventory, expenses, shop and library insights.</p>
        </div>
        <button
          onClick={downloadPdf}
          className="px-3 py-1.5 text-xs rounded-md border border-slate-300 hover:bg-slate-100"
        >
          Download Summary PDF
        </button>
      </div>

      <GlobalFilters
        search={search}
        onSearchChange={setSearch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        status={status}
        onStatusChange={setStatus}
        statuses={["unpaid", "partially_paid", "paid"]}
        onApply={load}
        searchPlaceholder="Search reports"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 h-72">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">Fee Collection</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feeChart}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1d4ed8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 h-72">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">Expense Categories</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={expenseCategoryChart} dataKey="value" nameKey="name" outerRadius={90}>
                {expenseCategoryChart.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Low Stock Alerts</p>
          <p className="text-lg font-semibold text-amber-700">{inventoryReport?.lowStockCount || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Canteen Sales</p>
          <p className="text-lg font-semibold text-emerald-700">Rs {canteenReport?.totalCanteen || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Shop Sales</p>
          <p className="text-lg font-semibold text-sky-700">Rs {canteenReport?.totalShop || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Library Fines</p>
          <p className="text-lg font-semibold text-rose-700">Rs {libraryReport?.totalFines || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Pending Dues</h2>
        <Table
          columns={[
            { key: "invoiceNo", header: "Invoice" },
            { key: "student", header: "Student", render: (r) => r.student?.regNumber || "-" },
            { key: "dueDate", header: "Due Date", render: (r) => (r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "-") },
            { key: "totalAmount", header: "Total", render: (r) => `Rs ${r.totalAmount}` },
            { key: "paidAmount", header: "Paid", render: (r) => `Rs ${r.paidAmount}` },
            { key: "balance", header: "Pending", render: (r) => `Rs ${r.totalAmount - r.paidAmount}` }
          ]}
          data={pendingDues}
          emptyText="No pending dues."
        />
      </div>
    </div>
  );
}
