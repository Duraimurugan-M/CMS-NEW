import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import Table from "../../components/tables/Table.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import DateRange from "../../components/utils/DateRange.jsx";
import SearchBar from "../../components/utils/SearchBar.jsx";

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [student, setStudent] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const isOfficeUser = ["admin", "superadmin", "accountant"].includes(user?.role);
  const linkedStudentId = user?.linkedStudent || user?.student;

  useEffect(() => {
    if (!user) return;
    load({ page: 1 });
  }, [user]);

  const load = async ({ page = 1 } = {}) => {
    if (!user) return;

    if (isOfficeUser) {
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
      setInvoices([]);
      setMeta({ page: res.data.page, totalPages: res.data.totalPages });
      return;
    }

    if (!linkedStudentId) {
      setPayments([]);
      setInvoices([]);
      setMeta({ page: 1, totalPages: 1 });
      return;
    }

    const [paymentRes, invoiceRes] = await Promise.all([
      api.get("/payments/mine", {
        params: { page, limit: 10, from: dateRange.from || undefined, to: dateRange.to || undefined }
      }),
      api.get("/invoices/mine", {
        params: { page: 1, limit: 50 }
      })
    ]);

    setPayments(paymentRes.data.items);
    setInvoices(invoiceRes.data.items || []);
    setMeta({ page: paymentRes.data.page, totalPages: paymentRes.data.totalPages });
  };

  const pendingInvoices = useMemo(
    () => invoices.filter((invoice) => ["unpaid", "partially_paid"].includes(invoice.status)),
    [invoices]
  );

  const downloadReceipt = (payment) => {
    const doc = new jsPDF();
    doc.text("Payment Receipt", 10, 10);
    doc.text(`Amount: Rs ${payment.amount}`, 10, 20);
    doc.text(`Status: ${payment.status}`, 10, 30);
    doc.text(`Method: ${payment.method}`, 10, 40);
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleString()}`, 10, 50);
    doc.text(`Gateway ID: ${payment.razorpayPaymentId || "-"}`, 10, 60);
    doc.save(`receipt-${payment._id}.pdf`);
  };

  const downloadInvoice = (invoice) => {
    const doc = new jsPDF();
    doc.text(`Invoice ${invoice.invoiceNo}`, 10, 10);
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 10, 20);
    doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}`, 10, 30);
    doc.text(`Status: ${invoice.status}`, 10, 40);
    let y = 52;
    (invoice.lines || []).forEach((line, index) => {
      doc.text(`${index + 1}. ${line.label || "Fee"} - Rs ${line.amount}`, 10, y);
      y += 8;
    });
    doc.text(`Total: Rs ${invoice.totalAmount}`, 10, y + 2);
    doc.text(`Paid: Rs ${invoice.paidAmount}`, 10, y + 10);
    doc.save(`${invoice.invoiceNo}.pdf`);
  };

  const startPayment = async (invoice) => {
    if (!linkedStudentId) {
      alert("No linked student found for this account.");
      return;
    }

    try {
      const orderRes = await api.post("/payments/create", {
        studentId: linkedStudentId,
        invoiceId: invoice._id,
        amount: Number(invoice.totalAmount) - Number(invoice.paidAmount || 0)
      });

      if (!window.Razorpay || !orderRes.data.razorpayKey) {
        alert("Razorpay checkout is not available. Please configure the payment gateway.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderRes.data.razorpayKey,
        amount: orderRes.data.order.amount,
        currency: orderRes.data.order.currency,
        name: "College CMS",
        description: `Fee payment for ${invoice.invoiceNo}`,
        order_id: orderRes.data.order.id,
        handler: async (response) => {
          await api.post("/payments/verify", {
            paymentId: orderRes.data.paymentId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
          await load({ page: 1 });
          alert("Payment successful.");
        }
      });

      razorpay.on("payment.failed", () => {
        alert("Payment failed or cancelled.");
      });

      razorpay.open();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to start online payment");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Payments</h1>
          <p className="text-xs text-slate-500">View payment history, invoices, and online payment status.</p>
        </div>

        {isOfficeUser && (
          <div className="flex items-center gap-3">
            <SearchBar
              value={student}
              onChange={setStudent}
              onSearch={() => load({ page: 1 })}
              placeholder="Filter by studentId"
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

      {!isOfficeUser && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Pending Invoices</h2>
          <Table
            columns={[
              { key: "invoiceNo", header: "Invoice" },
              { key: "dueDate", header: "Due Date", render: (invoice) => (invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-") },
              { key: "totalAmount", header: "Total", render: (invoice) => `Rs ${invoice.totalAmount}` },
              { key: "paidAmount", header: "Paid", render: (invoice) => `Rs ${invoice.paidAmount}` },
              { key: "balance", header: "Balance", render: (invoice) => `Rs ${invoice.totalAmount - invoice.paidAmount}` },
              { key: "status", header: "Status" },
              {
                key: "invoice",
                header: "Invoice PDF",
                render: (invoice) => (
                  <button
                    onClick={() => downloadInvoice(invoice)}
                    className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100"
                  >
                    PDF
                  </button>
                )
              },
              {
                key: "pay",
                header: "Pay",
                render: (invoice) =>
                  ["unpaid", "partially_paid"].includes(invoice.status) ? (
                    <button
                      onClick={() => startPayment(invoice)}
                      className="text-xs px-2 py-1 rounded-md bg-primary-600 text-white"
                    >
                      Pay Now
                    </button>
                  ) : (
                    "-"
                  )
              }
            ]}
            data={pendingInvoices}
            emptyText="No pending invoices."
          />
        </div>
      )}

      <Table
        columns={[
          { key: "createdAt", header: "Date", render: (payment) => new Date(payment.createdAt).toLocaleString() },
          { key: "student", header: "Student", render: (payment) => payment.student?.regNumber || payment.student?._id || "-" },
          { key: "amount", header: "Amount", render: (payment) => `Rs ${payment.amount}` },
          { key: "method", header: "Method" },
          { key: "status", header: "Status" },
          {
            key: "receipt",
            header: "Receipt",
            render: (payment) => (
              <button
                onClick={() => downloadReceipt(payment)}
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

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(page) => load({ page })} />
    </div>
  );
}
