import { useEffect, useState } from "react";
import api from "../../services/api";

export default function FeesPage() {
  const [feeHeads, setFeeHeads] = useState([]);

  useEffect(() => {
    api.get("/fees").then((res) => setFeeHeads(res.data));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Fees Management</h1>
        <p className="text-xs text-slate-500">
          Configure fee heads and manage student fee structures.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Default Amount</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {feeHeads.map((fh) => (
              <tr key={fh._id} className="border-b last:border-0 border-slate-100">
                <td className="px-3 py-2">{fh.name}</td>
                <td className="px-3 py-2">{fh.code}</td>
                <td className="px-3 py-2">₹ {fh.defaultAmount}</td>
                <td className="px-3 py-2">
                  {fh.isActive ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs">
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {feeHeads.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-xs text-slate-500" colSpan={4}>
                  No fee heads configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

