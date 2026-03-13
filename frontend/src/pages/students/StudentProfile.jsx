import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import { useAuthStore } from "../../store/authStore";

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [student, setStudent] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState("ledger");

  useEffect(() => {
    api.get(`/students/${id}`).then((res) => setStudent(res.data)).catch(() => {});
    if (["admin", "superadmin", "accountant"].includes(user?.role)) {
      api.get(`/ledger/${id}`).then((res) => setLedger(res.data)).catch(() => setLedger({ entries: [] }));
      api.get(`/invoices/student/${id}`, { params: { page: 1, limit: 20 } }).then((res) => setInvoices(res.data.items)).catch(() => setInvoices([]));
    }
    api.get(`/payments/student/${id}`, { params: { page: 1, limit: 20 } }).then((res) => setPayments(res.data.items)).catch(() => setPayments([]));
  }, [id, user?.role]);

  const balance = useMemo(() => {
    const last = ledger?.entries?.[ledger.entries.length - 1];
    return last?.balanceAfter ?? 0;
  }, [ledger]);

  if (!student) {
    return <div className="text-sm text-slate-600">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {student.firstName} {student.lastName || ""} ({student.regNumber})
          </h1>
          <p className="text-xs text-slate-500">
            Course: {student.course?.name || "-"} · Status: {student.status} · Balance: ₹ {balance}
          </p>
        </div>
        <Link
          to="/students"
          className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100"
        >
          Back
        </Link>
      </div>

      <div className="flex gap-2">
        {["ledger", "invoices", "payments"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-md border ${
              tab === t ? "bg-primary-50 border-primary-200 text-primary-700" : "border-slate-300 hover:bg-slate-100"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "ledger" && (
        <Table
          columns={[
            { key: "date", header: "Date", render: (e) => new Date(e.date).toLocaleString() },
            { key: "type", header: "Type" },
            { key: "description", header: "Description" },
            { key: "amount", header: "Amount", render: (e) => `₹ ${e.amount}` },
            { key: "balanceAfter", header: "Balance", render: (e) => `₹ ${e.balanceAfter}` }
          ]}
          data={ledger?.entries || []}
          emptyText="No ledger entries."
        />
      )}

      {tab === "invoices" && (
        <Table
          columns={[
            { key: "invoiceNo", header: "Invoice No" },
            { key: "issueDate", header: "Issue", render: (i) => new Date(i.issueDate).toLocaleDateString() },
            { key: "dueDate", header: "Due", render: (i) => (i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "-") },
            { key: "totalAmount", header: "Total", render: (i) => `₹ ${i.totalAmount}` },
            { key: "paidAmount", header: "Paid", render: (i) => `₹ ${i.paidAmount}` },
            { key: "status", header: "Status" }
          ]}
          data={invoices}
          emptyText="No invoices."
        />
      )}

      {tab === "payments" && (
        <Table
          columns={[
            { key: "createdAt", header: "Date", render: (p) => new Date(p.createdAt).toLocaleString() },
            { key: "amount", header: "Amount", render: (p) => `₹ ${p.amount}` },
            { key: "method", header: "Method" },
            { key: "status", header: "Status" },
            { key: "razorpayPaymentId", header: "Gateway ID", render: (p) => p.razorpayPaymentId || "-" }
          ]}
          data={payments}
          emptyText="No payments."
        />
      )}
    </div>
  );
}

