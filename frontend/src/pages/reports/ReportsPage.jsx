import { useEffect, useState } from "react";
import api from "../../services/api";
import jsPDF from "jspdf";

export default function ReportsPage() {
  const [feeReport, setFeeReport] = useState(null);

  useEffect(() => {
    api.get("/reports/fees").then((res) => setFeeReport(res.data));
  }, []);

  const downloadPdf = () => {
    if (!feeReport) return;
    const doc = new jsPDF();
    doc.text("Fee Collection Report", 10, 10);
    doc.text(`Total Billed: ${feeReport.totalBilled}`, 10, 20);
    doc.text(`Total Collected: ${feeReport.totalCollected}`, 10, 30);
    doc.text(`Total Pending: ${feeReport.totalPending}`, 10, 40);
    doc.save("fee-report.pdf");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Reports & Analytics</h1>
          <p className="text-xs text-slate-500">
            Monitor fee collection, dues, inventory, and expenses.
          </p>
        </div>
        <button
          onClick={downloadPdf}
          className="px-3 py-1.5 text-xs rounded-md border border-slate-300 hover:bg-slate-100"
        >
          Download Fee Report (PDF)
        </button>
      </div>
      {feeReport && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <p className="text-sm">Total Billed: ₹ {feeReport.totalBilled}</p>
          <p className="text-sm">Total Collected: ₹ {feeReport.totalCollected}</p>
          <p className="text-sm">Total Pending: ₹ {feeReport.totalPending}</p>
        </div>
      )}
    </div>
  );
}

