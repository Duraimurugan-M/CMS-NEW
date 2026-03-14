import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import { useAuthStore } from "../../store/authStore";

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [student, setStudent] = useState(null);
  const [ledger, setLedger] = useState({ entries: [] });
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [outpassRequests, setOutpassRequests] = useState([]);
  const [tab, setTab] = useState("overview");

  const studentId = id || user?.linkedStudent;
  const privileged = ["admin", "superadmin", "accountant", "staff"].includes(user?.role);

  useEffect(() => {
    if (!studentId) return;

    api.get(`/students/${studentId}`).then((res) => setStudent(res.data)).catch(() => setStudent(null));
    api.get(`/ledger/${studentId}`).then((res) => setLedger(res.data)).catch(() => setLedger({ entries: [] }));

    const invoiceRequest = privileged
      ? api.get(`/invoices/student/${studentId}`, { params: { page: 1, limit: 50 } })
      : api.get("/invoices/mine", { params: { page: 1, limit: 50 } });
    invoiceRequest.then((res) => setInvoices(res.data.items || [])).catch(() => setInvoices([]));

    const paymentRequest = privileged
      ? api.get(`/payments/student/${studentId}`, { params: { page: 1, limit: 50 } })
      : api.get("/payments/mine", { params: { page: 1, limit: 50 } });
    paymentRequest.then((res) => setPayments(res.data.items || [])).catch(() => setPayments([]));

    api
      .get("/leave", { params: { page: 1, limit: 10, student: privileged ? studentId : undefined } })
      .then((res) => setLeaveRequests(res.data.items || []))
      .catch(() => setLeaveRequests([]));

    api
      .get("/outpass", { params: { page: 1, limit: 10, student: privileged ? studentId : undefined } })
      .then((res) => setOutpassRequests(res.data.items || []))
      .catch(() => setOutpassRequests([]));
  }, [privileged, studentId]);

  const balance = useMemo(() => {
    const last = ledger?.entries?.[ledger.entries.length - 1];
    return last?.balanceAfter ?? 0;
  }, [ledger]);

  const downloadInvoicePdf = (invoice) => {
    const doc = new jsPDF();
    doc.text(`Invoice ${invoice.invoiceNo}`, 10, 12);
    doc.text(`Student: ${student.regNumber} - ${student.firstName} ${student.lastName || ""}`, 10, 22);
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 10, 30);
    doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}`, 10, 38);
    doc.text(`Status: ${invoice.status}`, 10, 46);
    doc.text(`Type: ${invoice.isAdvance ? "Advance" : "Regular"}`, 10, 54);
    let y = 66;
    (invoice.lines || []).forEach((line, index) => {
      doc.text(`${index + 1}. ${line.label || "Fee"} - Rs ${line.amount}`, 10, y);
      y += 8;
    });
    doc.text(`Total: Rs ${invoice.totalAmount}`, 10, y + 4);
    doc.text(`Paid: Rs ${invoice.paidAmount}`, 10, y + 12);
    doc.save(`${invoice.invoiceNo}.pdf`);
  };

  if (!studentId) {
    return <div className="text-sm text-slate-600">No linked student profile found.</div>;
  }

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
            Course: {student.course?.name || "-"} | Status: {student.status} | Balance: Rs {balance}
          </p>
        </div>
        <Link
          to={privileged ? "/students" : "/dashboard"}
          className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100"
        >
          {privileged ? "Back" : "Dashboard"}
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["overview", "ledger", "invoices", "payments"].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`text-xs px-3 py-1.5 rounded-md border ${
              tab === item ? "bg-primary-50 border-primary-200 text-primary-700" : "border-slate-300 hover:bg-slate-100"
            }`}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Student Profile</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-medium">Registration:</span> {student.regNumber}</p>
              <p><span className="font-medium">Admission Date:</span> {new Date(student.admissionDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Course:</span> {student.course?.name || "-"}</p>
              <p><span className="font-medium">Batch/Class:</span> {student.batch || "-"}</p>
              <p><span className="font-medium">Phone:</span> {student.phone || "-"}</p>
              <p><span className="font-medium">Email:</span> {student.email || "-"}</p>
              <p><span className="font-medium">Address:</span> {student.address || "-"}</p>
              <p><span className="font-medium">Advance Amount:</span> Rs {student.advancePayment || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Parent Details</h2>
            <div className="space-y-3">
              {(student.parents || []).length === 0 && <p className="text-sm text-slate-500">No parent details added.</p>}
              {(student.parents || []).map((parent, index) => (
                <div key={`${parent.phone}-${index}`} className="rounded-lg border border-slate-100 p-3">
                  <p className="text-sm font-medium text-slate-800">{parent.name}</p>
                  <p className="text-xs text-slate-500">{parent.relation}</p>
                  <p className="text-sm text-slate-700 mt-1">{parent.phone}</p>
                  <p className="text-sm text-slate-700">{parent.email || "-"}</p>
                  <p className="text-sm text-slate-700">{parent.address || "-"}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Academic / Admin Status</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-medium">Ledger Entries:</span> {ledger.entries?.length || 0}</p>
              <p><span className="font-medium">Invoices:</span> {invoices.length}</p>
              <p><span className="font-medium">Payments:</span> {payments.length}</p>
              <p><span className="font-medium">Leave Requests:</span> {leaveRequests.length}</p>
              <p><span className="font-medium">Outpass Requests:</span> {outpassRequests.length}</p>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-800 mb-1">Recent Leave Status</p>
                {(leaveRequests || []).slice(0, 3).map((row) => (
                  <p key={row._id} className="text-xs text-slate-600">
                    {new Date(row.fromDate).toLocaleDateString()} to {new Date(row.toDate).toLocaleDateString()} - {row.status}
                  </p>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 mb-1">Recent Outpass Status</p>
                {(outpassRequests || []).slice(0, 3).map((row) => (
                  <p key={row._id} className="text-xs text-slate-600">
                    {new Date(row.exitDateTime).toLocaleDateString()} - {row.status}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "ledger" && (
        <Table
          columns={[
            { key: "date", header: "Date", render: (entry) => new Date(entry.date).toLocaleString() },
            { key: "type", header: "Type" },
            { key: "description", header: "Description" },
            { key: "amount", header: "Amount", render: (entry) => `Rs ${entry.amount}` },
            { key: "balanceAfter", header: "Balance", render: (entry) => `Rs ${entry.balanceAfter}` }
          ]}
          data={ledger?.entries || []}
          emptyText="No ledger entries."
        />
      )}

      {tab === "invoices" && (
        <Table
          columns={[
            { key: "invoiceNo", header: "Invoice No" },
            { key: "issueDate", header: "Issue", render: (invoice) => new Date(invoice.issueDate).toLocaleDateString() },
            { key: "dueDate", header: "Due", render: (invoice) => (invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-") },
            { key: "totalAmount", header: "Total", render: (invoice) => `Rs ${invoice.totalAmount}` },
            { key: "paidAmount", header: "Paid", render: (invoice) => `Rs ${invoice.paidAmount}` },
            { key: "status", header: "Status" },
            { key: "kind", header: "Type", render: (invoice) => (invoice.isAdvance ? "Advance" : "Regular") },
            {
              key: "download",
              header: "Invoice PDF",
              render: (invoice) => (
                <button
                  onClick={() => downloadInvoicePdf(invoice)}
                  className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100"
                >
                  PDF
                </button>
              )
            }
          ]}
          data={invoices}
          emptyText="No invoices."
        />
      )}

      {tab === "payments" && (
        <Table
          columns={[
            { key: "createdAt", header: "Date", render: (payment) => new Date(payment.createdAt).toLocaleString() },
            { key: "amount", header: "Amount", render: (payment) => `Rs ${payment.amount}` },
            { key: "method", header: "Method" },
            { key: "status", header: "Status" },
            { key: "razorpayPaymentId", header: "Gateway ID", render: (payment) => payment.razorpayPaymentId || "-" }
          ]}
          data={payments}
          emptyText="No payments."
        />
      )}
    </div>
  );
}
