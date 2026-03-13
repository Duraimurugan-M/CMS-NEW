import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import Table from "../../components/tables/Table.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import DateRange from "../../components/utils/DateRange.jsx";
import SearchBar from "../../components/utils/SearchBar.jsx";
import jsPDF from "jspdf";

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [student, setStudent] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    if (!user) return;
    load({ page: 1 });
  }, [user]);

  const load = async ({ page = 1 } = {}) => {
    if (!user) return;
    // Admin/Accountant view: system payments list endpoint
    if (["admin", "superadmin", "accountant"].includes(user.role)) {
      const res = await api.get("/payments", {
        params: {
          page,
          limit: 10,
          student: student || undefined,
          from: dateRange.from || undefined,
          to: dateRange.to || undefined
        }
      });
      setPayments(res.data.items);
      setMeta({ page: res.data.page, totalPages: res.data.totalPages });
      return;
    }

    // Student/parent view
    if (user.student) {
      const res = await api.get(`/payments/student/${user.student}`, {
        params: { page, limit: 10, from: dateRange.from || undefined, to: dateRange.to || undefined }
      });
      setPayments(res.data.items);
      setMeta({ page: res.data.page, totalPages: res.data.totalPages });
    } else {
      setPayments([]);
      setMeta({ page: 1, totalPages: 1 });
    }
  };

  const downloadReceipt = (p) => {
    const doc = new jsPDF();
    doc.text("Payment Receipt", 10, 10);
    doc.text(`Amount: ₹${p.amount}`, 10, 20);
    doc.text(`Status: ${p.status}`, 10, 30);
    doc.text(`Method: ${p.method}`, 10, 40);
    doc.text(`Date: ${new Date(p.createdAt).toLocaleString()}`, 10, 50);
    doc.text(`Gateway ID: ${p.razorpayPaymentId || "-"}`, 10, 60);
    doc.save(`receipt-${p._id}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Payments</h1>
          <p className="text-xs text-slate-500">View payment history and download receipts.</p>
        </div>

        {["admin", "superadmin", "accountant"].includes(user?.role) && (
          <div className="flex items-center gap-3">
            <SearchBar
              value={student}
              onChange={setStudent}
              onSearch={() => load({ page: 1 })}
              placeholder="Filter by studentId (optional)"
            />
            <DateRange from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
            <button
              onClick={() => load({ page: 1 })}
              className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      <Table
        columns={[
          { key: "createdAt", header: "Date", render: (p) => new Date(p.createdAt).toLocaleString() },
          { key: "student", header: "Student", render: (p) => p.student?.regNumber || p.student?._id || "-" },
          { key: "amount", header: "Amount", render: (p) => `₹ ${p.amount}` },
          { key: "method", header: "Method" },
          { key: "status", header: "Status" },
          {
            key: "receipt",
            header: "Receipt",
            render: (p) => (
              <button
                onClick={() => downloadReceipt(p)}
                className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100"
              >
                PDF
              </button>
            )
          }
        ]}
        data={payments}
        emptyText="No payments."
      />

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load({ page: p })} />
    </div>
  );
}

