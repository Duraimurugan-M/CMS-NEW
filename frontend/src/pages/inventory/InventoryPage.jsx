import { useEffect, useState } from "react";
import api from "../../services/api";

export default function InventoryPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/inventory").then((res) => setItems(res.data));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Inventory</h1>
        <p className="text-xs text-slate-500">
          Track academic, hostel, and general stock inventory.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Qty</th>
              <th className="px-3 py-2 text-left">Location</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i._id} className="border-b last:border-0 border-slate-100">
                <td className="px-3 py-2">{i.name}</td>
                <td className="px-3 py-2">{i.category}</td>
                <td className="px-3 py-2">
                  {i.quantity} {i.unit}
                </td>
                <td className="px-3 py-2">{i.location || "-"}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-xs text-slate-500" colSpan={4}>
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

