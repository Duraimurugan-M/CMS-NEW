import { useAuthStore } from "../../store/authStore";

export default function Topbar() {
  const { user, clearAuth } = useAuthStore();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
      <h2 className="text-base font-semibold text-slate-800">Dashboard</h2>
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-slate-600">
            {user.name} ({user.role})
          </span>
        )}
        <button
          onClick={clearAuth}
          className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

