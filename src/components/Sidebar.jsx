
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  Building2,
  FileText,
  CreditCard,
  Crown,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import quantahireLogo from "../assets/logo.png";

// ==========================================
// NAVIGATION LINKS
// ==========================================

const navigation = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Analytics",
        path: "/analytics",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        name: "Users",
        path: "/users",
        icon: Users,
      },
      {
        name: "Jobs",
        path: "/jobs",
        icon: BriefcaseBusiness,
      },
      {
        name: "Companies",
        path: "/companies",
        icon: Building2,
      },
      {
        name: "Applications",
        path: "/applications",
        icon: FileText,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        name: "Payments",
        path: "/payments",
        icon: CreditCard,
      },
      {
        name: "Subscriptions",
        path: "/subscriptions",
        icon: Crown,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        name: "Settings",
        path: "/settings",
        icon: Settings,
      },
    ],
  },
];

// ==========================================
// GET CURRENT ADMIN
// ==========================================

function getCurrentAdmin() {
  try {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

// ==========================================
// SIDEBAR COMPONENT
// ==========================================

export default function Sidebar({
  isOpen = false,
  collapsed = false,
  onClose = () => {},
  onToggleCollapse = () => {},
}) {
  const navigate = useNavigate();

  const [admin] = useState(getCurrentAdmin);

  const displayName =
    admin?.full_name ||
    admin?.name ||
    admin?.username ||
    admin?.email?.split("@")[0] ||
    "Administrator";

  const adminEmail = admin?.email || "Admin Account";

  const initials = displayName
    .split(" ")
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    ["access", "refresh", "user"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    onClose();

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================
  // NAVIGATION ITEM
  // ==========================================

  const renderNavItem = (item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === "/dashboard"}
        onClick={onClose}
        title={collapsed ? item.name : undefined}
        className={({ isActive }) => `
          group relative flex min-h-[46px] items-center
          rounded-xl transition-all duration-200

          ${collapsed
            ? "lg:justify-center lg:px-2"
            : "px-3.5"
          }

          ${
            isActive
              ? "bg-gradient-to-r from-[#5145E5] to-[#695CF0] text-white shadow-lg shadow-[#5145E5]/25"
              : "text-indigo-100/70 hover:bg-white/10 hover:text-white"
          }
        `}
      >
        {({ isActive }) => (
          <>
            {/* ACTIVE INDICATOR */}
            {isActive && (
              <span className="absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#14E0C8]" />
            )}

            <Icon
              size={20}
              strokeWidth={isActive ? 2.3 : 1.9}
              className={`
                shrink-0 transition-colors
                ${
                  isActive
                    ? "text-[#14E0C8]"
                    : "text-indigo-200/70 group-hover:text-[#14E0C8]"
                }
              `}
            />

            <span
              className={`
                ml-3 whitespace-nowrap text-[13px] font-semibold
                ${collapsed ? "lg:hidden" : ""}
              `}
            >
              {item.name}
            </span>

            {isActive && !collapsed && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#14E0C8]" />
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#18124A] text-white">

      {/* BACKGROUND GRADIENT */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#211766] via-[#18124A] to-[#120D38]" />

      {/* DECORATIVE GLOW */}
      <div className="pointer-events-none absolute -right-28 top-16 h-64 w-64 rounded-full bg-[#5145E5]/25 blur-[90px]" />

      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#14E0C8]/10 blur-[90px]" />

      {/* ======================================
          HEADER / LOGO
      ====================================== */}

      <div className="relative z-10 flex h-[88px] shrink-0 items-center justify-between border-b border-white/10 px-4">

        <NavLink
          to="/dashboard"
          onClick={onClose}
          className={`
            flex min-w-0 items-center
            ${collapsed ? "lg:justify-center" : ""}
          `}
        >
          <div
            className={`
              flex shrink-0 items-center justify-center
              rounded-xl bg-white shadow-lg shadow-black/10

              ${collapsed
                ? "h-11 w-11 p-1.5"
                : "h-12 w-[125px] p-2"
              }
            `}
          >
            <img
              src={quantahireLogo}
              alt="Quantahire"
              className="h-full w-full object-contain"
            />
          </div>

          {!collapsed && (
            <div className="ml-3 min-w-0">
              <p className="text-[13px] font-extrabold tracking-wide text-white">
                QUANTAHIRE
              </p>

              <p className="mt-0.5 text-[10px] font-medium tracking-[0.16em] text-[#14E0C8]">
                ADMIN CONSOLE
              </p>
            </div>
          )}
        </NavLink>

        {/* MOBILE CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-indigo-100 transition hover:bg-white/10 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* ======================================
          NAVIGATION
      ====================================== */}

      <nav
        className="relative z-10 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-6"
        aria-label="Admin navigation"
      >
        {navigation.map((section) => (
          <div key={section.title}>

            {/* SECTION TITLE */}
            <div
              className={`
                mb-2 px-3 text-[10px] font-bold
                uppercase tracking-[0.18em] text-indigo-200/40

                ${collapsed ? "lg:hidden" : ""}
              `}
            >
              {section.title}
            </div>

            {collapsed && (
              <div className="mx-auto mb-3 hidden h-px w-7 bg-white/15 lg:block" />
            )}

            <div className="space-y-1">
              {section.items.map(renderNavItem)}
            </div>
          </div>
        ))}
      </nav>

      {/* ======================================
          BOTTOM SECTION
      ====================================== */}

      <div className="relative z-10 shrink-0 border-t border-white/10 p-3">

        {/* ADMIN BADGE */}
        <div
          className={`
            mb-3 flex items-center rounded-xl
            border border-[#14E0C8]/15
            bg-[#14E0C8]/5 p-3

            ${collapsed ? "lg:justify-center lg:p-2" : ""}
          `}
        >
          <ShieldCheck
            size={18}
            className="shrink-0 text-[#14E0C8]"
          />

          <div
            className={`
              ml-2 min-w-0
              ${collapsed ? "lg:hidden" : ""}
            `}
          >
            <p className="text-xs font-bold text-white">
              Admin Workspace
            </p>

            <p className="mt-0.5 text-[10px] text-indigo-200/60">
              Platform Management
            </p>
          </div>

          {!collapsed && (
            <Sparkles
              size={14}
              className="ml-auto shrink-0 text-[#14E0C8]"
            />
          )}
        </div>

        {/* ADMIN PROFILE */}
        <div
          className={`
            flex items-center gap-3 rounded-xl
            px-2 py-3
            ${collapsed ? "lg:justify-center" : ""}
          `}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5145E5] to-[#14E0C8] text-sm font-extrabold text-white shadow-lg">
            {initials || "AD"}
          </div>

          <div
            className={`
              min-w-0 flex-1
              ${collapsed ? "lg:hidden" : ""}
            `}
          >
            <p className="truncate text-xs font-bold text-white">
              {displayName}
            </p>

            <p className="mt-0.5 truncate text-[11px] text-indigo-200/60">
              {adminEmail}
            </p>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`
            mt-1 flex w-full items-center gap-3 rounded-xl
            px-3 py-3 text-left text-sm font-semibold
            text-red-200 transition-all duration-200
            hover:bg-red-500/15 hover:text-white

            ${collapsed ? "lg:justify-center" : ""}
          `}
        >
          <LogOut size={19} className="shrink-0" />

          <span className={collapsed ? "lg:hidden" : ""}>
            Logout
          </span>
        </button>

        {/* DESKTOP COLLAPSE BUTTON */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mt-3 hidden w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-indigo-100/70 transition hover:bg-white/10 hover:text-white lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : undefined}
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <>
              <ChevronLeft size={17} />
              Collapse Sidebar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
