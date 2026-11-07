
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, ShieldCheck } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const pageTitles = {
  "/dashboard": "Dashboard Overview",
  "/users": "Users Management",
  "/jobs": "Jobs Management",
  "/companies": "Companies Management",
  "/applications": "Job Applications",
  "/payments": "Payments",
  "/subscriptions": "Subscriptions",
  "/analytics": "Platform Analytics",
  "/settings": "Settings",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const location = useLocation();

  const currentPage =
    pageTitles[location.pathname] || "Admin Dashboard";

  // Close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile sidebar opens
  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#18124A]/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          transform transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <Sidebar
          isOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() =>
            setSidebarCollapsed((prev) => !prev)
          }
        />
      </aside>

      {/* MAIN CONTENT */}
      <div
        className={`
          flex min-h-screen min-w-0 flex-1 flex-col
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}
        `}
      >
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center border-b border-[#5145E5]/10 bg-white/95 px-4 shadow-sm shadow-[#5145E5]/5 backdrop-blur-xl sm:px-6 lg:px-8">

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="mr-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#5145E5]/10 bg-[#5145E5]/5 text-[#5145E5] transition hover:bg-[#5145E5]/10 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0 flex-1">
            <Topbar
              title={currentPage}
              onToggleSidebar={() =>
                setSidebarCollapsed((prev) => !prev)
              }
              sidebarCollapsed={sidebarCollapsed}
            />
          </div>
        </header>

        {/* MAIN PAGE CONTENT */}
        <main className="relative flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[#5145E5]/5 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#14E0C8]/5 blur-3xl" />

          <div className="relative z-10 mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-[#5145E5]/10 bg-white px-4 py-4 sm:px-6 lg:px-8">

          <div className="mx-auto flex max-w-[1600px] flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

            <p>
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-[#18124A]">
                Quantahire
              </span>
              . All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <ShieldCheck
                size={15}
                className="text-[#5145E5]"
              />

              <span>
                Quantahire Admin Console
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
