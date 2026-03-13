export default function Select({ label, error, children, ...props }) {
  return (
    <label className="block text-sm mb-3">
      <span className="block mb-1 text-slate-700">{label}</span>
      <select
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-600 mt-0.5 block">{error}</span>}
    </label>
  );
}

