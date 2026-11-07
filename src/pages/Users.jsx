
import { useCallback, useEffect, useState } from "react";
import {
  Users as UsersIcon,
  UserRound,
  Building2,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Eye,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  CalendarDays,
  Clock,
  AlertCircle,
  Crown,
} from "lucide-react";

import Swal from "sweetalert2";
import { adminUsersApi } from "../api/api";

// ==========================================
// CONSTANTS
// ==========================================

const PURPLE = "#5145E5";

const ROLE_OPTIONS = [
  { value: "worker", label: "Candidate" },
  { value: "employer", label: "Employer" },
  { value: "admin", label: "Administrator" },
];

const getStoredAdmin = () => {
  try {
    const raw =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(value ?? 0);

const formatDate = (value) => {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name) =>
  String(name || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

const getRoleLabel = (role) =>
  ROLE_OPTIONS.find((item) => item.value === role)
    ?.label || role || "User";

const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data === "object" && data !== null) {
    const first = Object.values(data)[0];

    if (Array.isArray(first)) {
      return first.join(" ");
    }

    if (typeof first === "string") {
      return first;
    }
  }

  return "Something went wrong. Please try again.";
};

// ==========================================
// STAT CARD
// ==========================================

function StatCard({ title, value, icon: Icon, teal }) {
  return (
    <div className="rounded-2xl border border-[#5145E5]/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#5145E5]/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">
            {title}
          </p>

          <h3 className="mt-3 text-2xl font-extrabold text-[#18124A]">
            {formatNumber(value)}
          </h3>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            teal
              ? "bg-[#14E0C8]/15 text-[#0A9D91]"
              : "bg-[#5145E5]/10 text-[#5145E5]"
          }`}
        >
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ROLE BADGE
// ==========================================

function RoleBadge({ role }) {
  const styles = {
    worker: "bg-indigo-50 text-indigo-700",
    employer: "bg-cyan-50 text-cyan-700",
    admin: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${
        styles[role] || "bg-slate-100 text-slate-600"
      }`}
    >
      {getRoleLabel(role)}
    </span>
  );
}

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ==========================================
// USER DETAILS MODAL
// ==========================================

function UserDetailsModal({
  user,
  onClose,
  onStatusChange,
  onRoleChange,
  updating,
  canChangeRoles,
  currentAdminId,
}) {
  if (!user) return null;

  const isSelf = String(user.id) === String(currentAdminId);
  const cannotDeactivate = isSelf || user.is_superuser;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#18124A]/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="User details"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-[#18124A] via-[#34238C] to-[#5145E5] p-6 text-white">

          <div className="flex items-start justify-between">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-xl font-extrabold">
              {getInitials(user.name)}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
              aria-label="Close user details"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="mt-4 text-xl font-extrabold">
            {user.name || "User"}
          </h2>

          <p className="mt-1 break-all text-sm text-indigo-100/80">
            {user.email}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <RoleBadge role={user.role} />
            <StatusBadge active={user.is_active} />
          </div>
        </div>

        <div className="space-y-5 p-6">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <CalendarDays size={15} />
                Date Joined
              </p>

              <p className="mt-2 text-sm font-bold text-[#18124A]">
                {formatDate(user.date_joined)}
              </p>
            </div>

            <div>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <Clock size={15} />
                Last Login
              </p>

              <p className="mt-2 text-sm font-bold text-[#18124A]">
                {formatDate(user.last_login)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Account ID
              </p>

              <p className="mt-2 break-all text-sm font-bold text-[#18124A]">
                {user.id}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Administrator Privileges
              </p>

              <p className="mt-2 text-sm font-bold text-[#18124A]">
                {user.is_superuser
                  ? "Superuser"
                  : user.is_staff
                  ? "Staff"
                  : user.role === "admin"
                  ? "Administrator"
                  : "Standard User"}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="mb-3 text-sm font-bold text-[#18124A]">
              Account Management
            </h3>

            <div className="space-y-4">

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">
                  User Role
                </label>

                <select
                  value={user.role || "worker"}
                  disabled={
                    updating ||
                    !canChangeRoles ||
                    user.is_superuser
                  }
                  onChange={(event) =>
                    onRoleChange(user, event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#18124A] outline-none focus:border-[#5145E5] disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option
                      key={role.value}
                      value={role.value}
                    >
                      {role.label}
                    </option>
                  ))}
                </select>

                {!canChangeRoles && (
                  <p className="mt-2 text-xs text-slate-400">
                    Only superusers can change account roles.
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={updating || (!user.is_active && false) || (user.is_active && cannotDeactivate)}
                onClick={() => onStatusChange(user)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  user.is_active
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                {user.is_active ? (
                  <>
                    <UserX size={18} />
                    Deactivate Account
                  </>
                ) : (
                  <>
                    <UserCheck size={18} />
                    Activate Account
                  </>
                )}
              </button>

              {cannotDeactivate && user.is_active && (
                <p className="text-xs text-slate-400">
                  Your own account and superuser accounts
                  cannot be deactivated here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN USERS PAGE
// ==========================================

export default function Users() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null);

  const currentAdmin = getStoredAdmin();

  const canChangeRoles =
    currentAdmin?.is_superuser === true;

  // ========================================
  // FETCH USERS
  // ========================================

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminUsersApi.getUsers({
        page,
        page_size: pageSize,
        ...(search ? { search } : {}),
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
      });

      const data = response.data;

      setUsers(
        Array.isArray(data.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : []
      );

      setTotalCount(
        typeof data.count === "number"
          ? data.count
          : Array.isArray(data)
          ? data.length
          : 0
      );
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, role, status]);

  // ========================================
  // FETCH STATS
  // ========================================

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminUsersApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error("Fetch user stats error:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ========================================
  // REFRESH
  // ========================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await Promise.all([
      fetchUsers(),
      fetchStats(),
    ]);

    setRefreshing(false);
  };

  // ========================================
  // SEARCH
  // ========================================

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
  };

  // ========================================
  // VIEW USER
  // ========================================

  const handleViewUser = async (user) => {
    try {
      const response = await adminUsersApi.getUser(user.id);
      setSelectedUser(response.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Unable to load user",
        text: getErrorMessage(err),
        confirmButtonColor: PURPLE,
      });
    }
  };

  // ========================================
  // UPDATE ACCOUNT STATUS
  // ========================================

  const handleStatusChange = async (user) => {
    const nextStatus = !user.is_active;

    const result = await Swal.fire({
      title: nextStatus
        ? "Activate account?"
        : "Deactivate account?",
      text: nextStatus
        ? `Activate ${user.name}'s account?`
        : `Deactivate ${user.name}'s account?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: nextStatus
        ? PURPLE
        : "#DC2626",
      cancelButtonColor: "#94A3B8",
      confirmButtonText: nextStatus
        ? "Yes, activate"
        : "Yes, deactivate",
    });

    if (!result.isConfirmed) return;

    setUpdating(true);

    try {
      const response = await adminUsersApi.updateStatus(
        user.id,
        nextStatus
      );

      const updatedUser = response.data.user;

      setUsers((previous) =>
        previous.map((item) =>
          item.id === user.id ? updatedUser : item
        )
      );

      setSelectedUser(updatedUser);

      await fetchStats();

      Swal.fire({
        icon: "success",
        title: "Account updated",
        text: response.data.message,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: getErrorMessage(err),
        confirmButtonColor: PURPLE,
      });
    } finally {
      setUpdating(false);
    }
  };

  // ========================================
  // UPDATE ROLE
  // ========================================

  const handleRoleChange = async (user, nextRole) => {
    if (user.role === nextRole) return;

    const result = await Swal.fire({
      title: "Change user role?",
      text: `Change ${user.name}'s role to ${getRoleLabel(nextRole)}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: PURPLE,
      confirmButtonText: "Update Role",
    });

    if (!result.isConfirmed) return;

    setUpdating(true);

    try {
      const response = await adminUsersApi.updateRole(
        user.id,
        nextRole
      );

      const updatedUser = response.data.user;

      setUsers((previous) =>
        previous.map((item) =>
          item.id === user.id ? updatedUser : item
        )
      );

      setSelectedUser(updatedUser);

      await fetchStats();

      Swal.fire({
        icon: "success",
        title: "Role updated",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: getErrorMessage(err),
        confirmButtonColor: PURPLE,
      });
    } finally {
      setUpdating(false);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / pageSize)
  );

  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: UsersIcon,
    },
    {
      title: "Candidates",
      value: stats.total_candidates,
      icon: UserRound,
      teal: true,
    },
    {
      title: "Employers",
      value: stats.total_employers,
      icon: Building2,
    },
    {
      title: "Active Users",
      value: stats.active_users,
      icon: UserCheck,
      teal: true,
    },
  ];

  return (
    <div className="space-y-6 pb-8">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18124A] via-[#34238C] to-[#5145E5] p-6 text-white shadow-xl shadow-[#5145E5]/15 sm:p-8">

        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#14E0C8]/20 blur-[70px]" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#14E0C8]/25 bg-[#14E0C8]/10 px-3 py-1.5 text-[11px] font-bold text-[#8DFFF1]">
              <ShieldCheck size={14} />
              USER ADMINISTRATION
            </div>

            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Users Management
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100/80">
              Manage candidates, employers, administrators,
              and account access across Quantahire.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/15 px-4 py-3 text-sm font-bold transition hover:bg-white/25 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="rounded-2xl border border-[#5145E5]/10 bg-white p-4 shadow-sm sm:p-5">

        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-[#5145E5]" />

          <h2 className="text-sm font-extrabold text-[#18124A]">
            Search & Filter Users
          </h2>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">

          <form
            onSubmit={handleSearch}
            className="flex min-w-0 flex-1 gap-2"
          >
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5145E5]/60"
              />

              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search name, username or email..."
                className="w-full rounded-xl border border-slate-200 bg-[#F8F9FF] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#5145E5]"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-[#5145E5] px-4 py-3 text-sm font-bold text-white hover:bg-[#4338CA]"
            >
              Search
            </button>
          </form>

          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-[#F8F9FF] px-4 py-3 text-sm text-[#18124A] outline-none focus:border-[#5145E5] lg:w-40"
          >
            <option value="">All Roles</option>

            {ROLE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-[#F8F9FF] px-4 py-3 text-sm text-[#18124A] outline-none focus:border-[#5145E5] lg:w-40"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ======================================
          USERS LIST
      ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#5145E5]/10 bg-white shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-base font-extrabold text-[#18124A]">
              Registered Users
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {formatNumber(totalCount)} matching accounts
            </p>
          </div>

          <span className="rounded-full bg-[#5145E5]/5 px-3 py-1.5 text-xs font-bold text-[#5145E5]">
            Page {page} of {totalPages}
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="m-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <UsersIcon
              size={36}
              className="text-[#5145E5]/40"
            />

            <p className="mt-4 text-sm font-bold text-[#18124A]">
              No users found
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#F8F9FF]">
                  <tr>
                    {[
                      "User",
                      "Role",
                      "Status",
                      "Joined",
                      "Last Login",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-[#F8F9FF]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5145E5]/10 text-xs font-extrabold text-[#5145E5]">
                            {getInitials(user.name)}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate text-sm font-bold text-[#18124A]">
                              {user.name || "User"}
                            </p>

                            <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge active={user.is_active} />
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formatDate(user.date_joined)}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formatDate(user.last_login)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleViewUser(user)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#5145E5]/10 px-3 py-2 text-xs font-bold text-[#5145E5] transition hover:bg-[#5145E5]/20"
                        >
                          <Eye size={15} />
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="divide-y divide-slate-100 md:hidden">
              {users.map((user) => (
                <div key={user.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5145E5]/10 text-sm font-extrabold text-[#5145E5]">
                      {getInitials(user.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#18124A]">
                        {user.name || "User"}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <RoleBadge role={user.role} />
                    <StatusBadge active={user.is_active} />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Joined {formatDate(user.date_joined)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleViewUser(user)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#5145E5]/10 px-3 py-2 text-xs font-bold text-[#5145E5]"
                    >
                      <Eye size={15} />
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PAGINATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
          <p className="text-xs text-slate-400">
            Showing{" "}
            {totalCount === 0
              ? 0
              : (page - 1) * pageSize + 1}
            {" - "}
            {Math.min(page * pageSize, totalCount)}
            {" of "}
            {formatNumber(totalCount)}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((previous) => previous - 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-[#5145E5]/5 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="px-2 text-xs font-bold text-[#18124A]">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((previous) => previous + 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-[#5145E5]/5 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onStatusChange={handleStatusChange}
          onRoleChange={handleRoleChange}
          updating={updating}
          canChangeRoles={canChangeRoles}
          currentAdminId={currentAdmin?.id}
        />
      )}
    </div>
  );
}
