export default function SearchBar({ value, onChange, onSearch, placeholder = "Search..." }) {
  return (
    <div className="flex gap-2">
      <input
        placeholder={placeholder}
        className="px-3 py-1.5 text-sm border border-slate-300 rounded-md w-72"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        onClick={onSearch}
        className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white"
      >
        Search
      </button>
    </div>
  );
}

