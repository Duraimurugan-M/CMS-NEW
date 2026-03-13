import SearchBar from "./SearchBar.jsx";
import DateRange from "./DateRange.jsx";
import Select from "../forms/Select.jsx";

export default function GlobalFilters({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  status,
  onStatusChange,
  statuses = [],
  onApply,
  searchPlaceholder = "Search..."
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-end gap-3">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        onSearch={onApply}
        placeholder={searchPlaceholder}
      />
      <DateRange from={dateRange?.from} to={dateRange?.to} onChange={onDateRangeChange} />
      <div className="min-w-44">
        <Select label="Status" value={status || ""} onChange={(e) => onStatusChange?.(e.target.value)}>
          <option value="">All</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
      <button
        onClick={onApply}
        className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white h-9"
      >
        Apply
      </button>
    </div>
  );
}
