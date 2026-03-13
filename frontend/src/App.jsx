import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
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

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthLogin />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <DashboardHome />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <DashboardHome />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/students"
        element={
          <PrivateRoute>
            <Layout>
              <StudentsList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/students/:id"
        element={
          <PrivateRoute>
            <Layout>
              <StudentProfile />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/fees"
        element={
          <PrivateRoute>
            <Layout>
              <FeesPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <PrivateRoute>
            <Layout>
              <CoursesPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <PrivateRoute>
            <Layout>
              <PaymentsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <PrivateRoute>
            <Layout>
              <InventoryPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/library"
        element={
          <PrivateRoute>
            <Layout>
              <LibraryPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Layout>
              <ReportsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/circulars"
        element={
          <PrivateRoute>
            <Layout>
              <CircularsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Layout>
              <NotificationsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

