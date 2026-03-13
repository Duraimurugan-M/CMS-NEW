import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import api from "./services/api";
import Layout from "./components/layout/Layout.jsx";
import AuthLogin from "./pages/AuthLogin.jsx";
import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
import StudentsList from "./pages/students/StudentsList.jsx";
import StudentProfile from "./pages/students/StudentProfile.jsx";
import FeesPage from "./pages/fees/FeesPage.jsx";
import PaymentsPage from "./pages/payments/PaymentsPage.jsx";
import InventoryPage from "./pages/inventory/InventoryPage.jsx";
import LibraryPage from "./pages/library/LibraryPage.jsx";
import ReportsPage from "./pages/reports/ReportsPage.jsx";
import CircularsPage from "./pages/circulars/CircularsPage.jsx";
import NotificationsPage from "./pages/notifications/NotificationsPage.jsx";
import CoursesPage from "./pages/courses/CoursesPage.jsx";
import SettingsPage from "./pages/settings/SettingsPage.jsx";
import LeavePage from "./pages/leave/LeavePage.jsx";
import OutpassPage from "./pages/outpass/OutpassPage.jsx";
import CheckInPage from "./pages/checkin/CheckInPage.jsx";
import ExpensesPage from "./pages/expenses/ExpensesPage.jsx";
import ShopPage from "./pages/shop/ShopPage.jsx";

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleRoute({ children, roles }) {
  const { user } = useAuthStore();
  if (!user) return null;
  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function ProtectedPage({ children, roles = null }) {
  return (
    <PrivateRoute>
      <Layout>{roles ? <RoleRoute roles={roles}>{children}</RoleRoute> : children}</Layout>
    </PrivateRoute>
  );
}

export default function App() {
  const { token, user, setUser } = useAuthStore();

  useEffect(() => {
    if (!token || user) return;
    api
      .get("/auth/profile")
      .then((res) => setUser(res.data))
      .catch(() => {});
  }, [token, user, setUser]);

  return (
    <Routes>
      <Route path="/login" element={<AuthLogin />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedPage><DashboardHome /></ProtectedPage>} />

      <Route path="/students" element={<ProtectedPage roles={["admin", "superadmin", "accountant", "staff"]}><StudentsList /></ProtectedPage>} />
      <Route path="/students/:id" element={<ProtectedPage roles={["admin", "superadmin", "accountant", "staff"]}><StudentProfile /></ProtectedPage>} />
      <Route path="/courses" element={<ProtectedPage roles={["admin", "superadmin"]}><CoursesPage /></ProtectedPage>} />

      <Route path="/fees" element={<ProtectedPage roles={["admin", "superadmin", "accountant"]}><FeesPage /></ProtectedPage>} />
      <Route path="/payments" element={<ProtectedPage roles={["admin", "superadmin", "accountant", "student", "parent"]}><PaymentsPage /></ProtectedPage>} />
      <Route path="/expenses" element={<ProtectedPage roles={["admin", "superadmin", "accountant"]}><ExpensesPage /></ProtectedPage>} />

      <Route path="/inventory" element={<ProtectedPage roles={["admin", "superadmin", "accountant"]}><InventoryPage /></ProtectedPage>} />
      <Route path="/shop" element={<ProtectedPage roles={["shopadmin", "canteen", "superadmin", "admin", "accountant"]}><ShopPage /></ProtectedPage>} />
      <Route path="/library" element={<ProtectedPage roles={["librarian", "superadmin", "admin"]}><LibraryPage /></ProtectedPage>} />

      <Route path="/leave" element={<ProtectedPage roles={["parent", "student", "admin", "superadmin", "staff"]}><LeavePage /></ProtectedPage>} />
      <Route path="/outpass" element={<ProtectedPage roles={["parent", "student", "admin", "superadmin", "staff"]}><OutpassPage /></ProtectedPage>} />
      <Route path="/checkin" element={<ProtectedPage roles={["staff", "admin", "superadmin"]}><CheckInPage /></ProtectedPage>} />

      <Route path="/reports" element={<ProtectedPage roles={["admin", "superadmin", "accountant", "librarian"]}><ReportsPage /></ProtectedPage>} />
      <Route path="/circulars" element={<ProtectedPage><CircularsPage /></ProtectedPage>} />
      <Route path="/notifications" element={<ProtectedPage><NotificationsPage /></ProtectedPage>} />
      <Route path="/settings" element={<ProtectedPage roles={["admin", "superadmin"]}><SettingsPage /></ProtectedPage>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
