import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    // For demo, superadmin/admin can view all payments by not filtering; in real app you'd add admin endpoint
    if (!user) return;
    if (user.role === "student") {
      // needs linkage to studentId; placeholder
    }
    // Simple: get all by hitting reports/fees and using payments list
    api
      .get("/reports/fees")
      .then((res) => setPayments(res.data.payments || []))
      .catch(() => {});
  }, [user]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Payments</h1>
        <p className="text-xs text-slate-500">
          View payment history and online payment confirmations.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Method</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b last:border-0 border-slate-100">
                <td className="px-3 py-2">₹ {p.amount}</td>
                <td className="px-3 py-2">{p.method}</td>
                <td className="px-3 py-2">{p.status}</td>
                <td className="px-3 py-2">
                  {new Date(p.createdAt).toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "short"
                  })}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-xs text-slate-500" colSpan={4}>
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

