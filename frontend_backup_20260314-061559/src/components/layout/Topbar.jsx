import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/api";

const titles = {
  "/dashboard": "Dashboard",
  "/students": "Students",
  "/courses": "Courses",
  "/fees": "Fees",
  "/payments": "Payments",
  "/expenses": "Expenses",
  "/inventory": "Inventory",
  "/shop": "Shop/Canteen",
  "/library": "Library",
  "/leave": "Leave",
  "/outpass": "Outpass",
  "/checkin": "Check-In",
  "/reports": "Reports",
  "/circulars": "Circulars",
  "/notifications": "Notifications",
  "/users": "User Management",
  "/settings": "Settings"
};

export default function Topbar({ onMenuClick = null }) {
  const { user, refreshToken, clearAuth } = useAuthStore();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    api
      .get("/notifications/unread-count")
      .then((res) => setUnread(res.data.unread || 0))
      .catch(() => {});
  }, [location.pathname, user]);

  const logout = async () => {
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch (_) {
      // Ignore logout API failures.
    } finally {
      clearAuth();
    }
  };

  return (
    <header className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 border-b border-slate-200 bg-white gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100"
        >
          Menu
        </button>
        <h2 className="text-sm sm:text-base font-semibold text-slate-800 truncate">{titles[location.pathname] || "Dashboard"}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/notifications" className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100 whitespace-nowrap">
          Notifications {unread > 0 ? `(${unread})` : ""}
        </Link>
        {user && (
          <span className="text-xs sm:text-sm text-slate-600 hidden md:inline">
            {user.name} ({user.role})
          </span>
        )}
        <button
          onClick={logout}
          className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
