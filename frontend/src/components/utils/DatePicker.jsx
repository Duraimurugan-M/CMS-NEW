export default function DatePicker({ label, value, onChange, ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="block mb-1 text-slate-700">{label}</span>}
      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="px-3 py-1.5 text-sm border border-slate-300 rounded-md w-full"
        {...props}
      />
    </label>
  );
}
