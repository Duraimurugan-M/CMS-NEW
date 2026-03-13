import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <button
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="p-3 sm:p-4 md:p-6 bg-slate-50 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
