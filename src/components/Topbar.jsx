
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserRound,
  Settings,
  LogOut,
  ShieldCheck,
  Sparkles,
  X,
  Command,
} from "lucide-react";

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
// TOPBAR COMPONENT
// ==========================================

export default function Topbar({
  title = "Dashboard Overview",
  onToggleSidebar = () => {},
  sidebarCollapsed = false,
}) {
  const navigate = useNavigate();

  const [admin] = useState(getCurrentAdmin);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);

  const displayName =
    admin?.full_name ||
    admin?.name ||
    admin?.username ||
    admin?.email?.split("@")[0] ||
    "Administrator";

  const email = admin?.email || "Admin Account";

  const initials = displayName
    .split(" ")
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ==========================================
  // CLOSE DROPDOWNS ON OUTSIDE CLICK / ESC
  // ==========================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    ["access", "refresh", "user"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    setProfileOpen(false);
    navigate("/login", { replace: true });
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    // Search the jobs management page.
    navigate(`/jobs?search=${encodeURIComponent(query)}`);

    setSearchOpen(false);
  };

  return (
    <div className="flex h-full w-full min-w-0 items-center justify-between gap-3">

      {/* ======================================
          LEFT SIDE
      ====================================== */}

      <div className="flex min-w-0 items-center gap-3">

        {/* DESKTOP SIDEBAR TOGGLE */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#5145E5]/10 bg-[#5145E5]/5 text-[#5145E5] transition hover:bg-[#5145E5]/10 lg:flex"
          title={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          aria-label={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {sidebarCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>

        {/* PAGE TITLE */}
        <div className="min-w-0">
          <div className="mb-1 hidden items-center gap-2 sm:flex">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5145E5]/60">
              Quantahire
            </span>

            <span className="text-xs text-slate-300">/</span>

            <span className="text-[11px] font-medium text-slate-400">
              Admin Console
            </span>
          </div>

          <h1 className="truncate text-base font-extrabold tracking-tight text-[#18124A] sm:text-lg lg:text-xl">
            {title}
          </h1>
        </div>
      </div>

      {/* ======================================
          RIGHT SIDE
      ====================================== */}

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">

        {/* SEARCH */}
        <div ref={searchRef} className="relative">

          {/* DESKTOP SEARCH */}
          <form
            onSubmit={handleSearch}
            className="hidden h-11 items-center gap-2 rounded-xl border border-[#5145E5]/10 bg-[#F8F9FF] px-3 transition focus-within:border-[#5145E5]/40 focus-within:ring-4 focus-within:ring-[#5145E5]/5 xl:flex"
          >
            <Search size={18} className="text-[#5145E5]/60" />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search jobs..."
              aria-label="Search jobs"
              className="w-40 bg-transparent text-sm text-[#18124A] outline-none placeholder:text-slate-400 2xl:w-56"
            />

            <span className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] text-slate-400">
              <Command size={11} />
              K
            </span>
          </form>

          {/* MOBILE / TABLET SEARCH BUTTON */}
          <button
            type="button"
            onClick={() => {
              setSearchOpen((previous) => !previous);
              setProfileOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#5145E5] transition hover:bg-[#5145E5]/5 xl:hidden"
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            <Search size={21} />
          </button>

          {/* MOBILE SEARCH DROPDOWN */}
          {searchOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-[min(85vw,340px)] rounded-2xl border border-[#5145E5]/10 bg-white p-4 shadow-xl shadow-[#18124A]/10 xl:hidden">

              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#18124A]">
                  Search Jobs
                </p>

                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-[#5145E5]">
                  <Search
                    size={17}
                    className="shrink-0 text-[#5145E5]"
                  />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search jobs..."
                    aria-label="Search jobs"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-3 w-full rounded-xl bg-[#5145E5] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4338CA]"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div ref={notificationsRef} className="relative">

          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((previous) => !previous);
              setProfileOpen(false);
              setSearchOpen(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#5145E5] transition hover:bg-[#5145E5]/5"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell size={21} />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-[min(85vw,360px)] overflow-hidden rounded-2xl border border-[#5145E5]/10 bg-white shadow-xl shadow-[#18124A]/10">

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#18124A]">
                    Notifications
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Platform updates
                  </p>
                </div>

                <div className="rounded-xl bg-[#5145E5]/10 p-2 text-[#5145E5]">
                  <Bell size={18} />
                </div>
              </div>

              {/* EMPTY STATE */}
              <div className="flex flex-col items-center px-5 py-10 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5145E5]/5 text-[#5145E5]">
                  <Bell size={25} />
                </div>

                <p className="text-sm font-bold text-[#18124A]">
                  No notifications yet
                </p>

                <p className="mt-2 max-w-[240px] text-xs leading-5 text-slate-400">
                  New platform notifications will appear
                  here once connected to the backend.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SEPARATOR */}
        <div className="hidden h-8 w-px bg-[#5145E5]/10 sm:block" />

        {/* ======================================
            ADMIN PROFILE
        ====================================== */}

        <div ref={profileRef} className="relative">

          <button
            type="button"
            onClick={() => {
              setProfileOpen((previous) => !previous);
              setNotificationsOpen(false);
              setSearchOpen(false);
            }}
            className="group flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[#5145E5]/5 sm:gap-3"
            aria-label="Administrator profile menu"
            aria-expanded={profileOpen}
          >
            {/* AVATAR */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5145E5] to-[#34238C] text-sm font-extrabold text-white shadow-md shadow-[#5145E5]/20">
              {initials || "AD"}

              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-[#14E0C8]" />
            </div>

            {/* PROFILE DETAILS */}
            <div className="hidden max-w-[150px] text-left md:block">
              <p className="truncate text-xs font-extrabold text-[#18124A]">
                {displayName}
              </p>

              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                Administrator
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition-transform md:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* PROFILE DROPDOWN */}
          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-[#5145E5]/10 bg-white shadow-xl shadow-[#18124A]/10">

              {/* HEADER */}
              <div className="bg-gradient-to-r from-[#5145E5]/10 to-[#14E0C8]/10 px-5 py-5">

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5145E5] to-[#34238C] text-sm font-extrabold text-white">
                    {initials || "AD"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#18124A]">
                      {displayName}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#14E0C8]/30 bg-white/80 px-3 py-1.5 text-[10px] font-bold text-[#34238C]">
                  <ShieldCheck size={13} className="text-[#16BFAF]" />
                  Administrator Account
                </div>
              </div>

              {/* MENU ITEMS */}
              <div className="p-2">

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-[#5145E5]/5 hover:text-[#5145E5]"
                >
                  <UserRound size={18} />
                  My Account
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-[#5145E5]/5 hover:text-[#5145E5]"
                >
                  <Settings size={18} />
                  Settings
                </button>
              </div>

              <div className="mx-3 h-px bg-slate-100" />

              {/* LOGOUT */}
              <div className="p-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 bg-[#F8F9FF] px-4 py-3 text-[10px] font-semibold text-slate-400">
                <Sparkles size={13} className="text-[#5145E5]" />
                Quantahire Admin Console
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
