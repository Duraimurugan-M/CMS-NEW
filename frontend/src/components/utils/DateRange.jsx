export default function DateRange({ from, to, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={from || ""}
        onChange={(e) => onChange({ from: e.target.value, to })}
        className="px-3 py-1.5 text-sm border border-slate-300 rounded-md"
      />
      <span className="text-xs text-slate-500">to</span>
      <input
        type="date"
        value={to || ""}
        onChange={(e) => onChange({ from, to: e.target.value })}
        className="px-3 py-1.5 text-sm border border-slate-300 rounded-md"
      />
    </div>
  );
}

