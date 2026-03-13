import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const menus = {
  superadmin: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/students", label: "Students" },
    { to: "/courses", label: "Courses" },
    { to: "/fees", label: "Fees" },
    { to: "/payments", label: "Payments" },
    { to: "/expenses", label: "Expenses" },
    { to: "/inventory", label: "Inventory" },
    { to: "/shop", label: "Shop/Canteen" },
    { to: "/library", label: "Library" },
    { to: "/leave", label: "Leave" },
    { to: "/outpass", label: "Outpass" },
    { to: "/checkin", label: "Check-In" },
    { to: "/reports", label: "Reports" },
    { to: "/users", label: "Users" },
    { to: "/circulars", label: "Circulars" },
    { to: "/notifications", label: "Notifications" },
    { to: "/settings", label: "Settings" }
  ],
  admin: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/students", label: "Students" },
    { to: "/courses", label: "Courses" },
    { to: "/fees", label: "Fees" },
    { to: "/inventory", label: "Inventory" },
    { to: "/shop", label: "Shop/Canteen" },
    { to: "/library", label: "Library" },
    { to: "/leave", label: "Leave" },
    { to: "/outpass", label: "Outpass" },
    { to: "/checkin", label: "Check-In" },
    { to: "/expenses", label: "Expenses" },
    { to: "/reports", label: "Reports" },
    { to: "/circulars", label: "Circulars" },
    { to: "/notifications", label: "Notifications" },
    { to: "/settings", label: "Settings" }
  ],
  accountant: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/students", label: "Students" },
    { to: "/fees", label: "Fees" },
    { to: "/payments", label: "Payments" },
    { to: "/expenses", label: "Expenses" },
    { to: "/reports", label: "Reports" },
    { to: "/notifications", label: "Notifications" }
  ],
  staff: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/students", label: "Students" },
    { to: "/leave", label: "Leave" },
    { to: "/outpass", label: "Outpass" },
    { to: "/checkin", label: "Check-In" },
    { to: "/circulars", label: "Circulars" },
    { to: "/notifications", label: "Notifications" }
  ],
  student: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/payments", label: "Payments" },
    { to: "/leave", label: "Leave" },
    { to: "/outpass", label: "Outpass" },
    { to: "/circulars", label: "Circulars" },
    { to: "/notifications", label: "Notifications" }
  ],
  parent: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/payments", label: "Payments" },
    { to: "/leave", label: "Leave" },
    { to: "/outpass", label: "Outpass" },
    { to: "/circulars", label: "Circulars" },
    { to: "/notifications", label: "Notifications" }
  ],
  librarian: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/library", label: "Library" },
    { to: "/reports", label: "Reports" },
    { to: "/notifications", label: "Notifications" }
  ],
  shopadmin: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/shop", label: "Shop/Canteen" },
    { to: "/notifications", label: "Notifications" }
  ],
  canteen: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/shop", label: "Shop/Canteen" },
    { to: "/notifications", label: "Notifications" }
  ]
};

export default function Sidebar({ open = true, onNavigate = null }) {
  const { user } = useAuthStore();
  const items = user?.role ? menus[user.role] || menus.student : menus.student;

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 w-64 bg-white border-r border-slate-200 h-screen transform transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-lg font-semibold text-primary-600">College CMS</h1>
        {user && (
          <p className="text-xs text-slate-500 mt-1">
            {user.name} - {user.role}
          </p>
        )}
      </div>
      <nav className="p-3 space-y-1 max-h-[calc(100vh-82px)] overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm ${
                isActive
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
