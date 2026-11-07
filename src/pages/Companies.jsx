
import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  CirclePause,
  BadgeCheck,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Power,
  ShieldAlert,
} from "lucide-react";

import Swal from "sweetalert2";
import { adminCompaniesApi } from "../api/api";

const PURPLE = "#5145E5";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(value ?? 0);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;

  if (data && typeof data === "object") {
    const value = Object.values(data)[0];

    if (Array.isArray(value)) return value.join(" ");
    if (typeof value === "string") return value;
  }

  return "Something went wrong. Please try again.";
};

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

const getInitials = (name) =>
  String(name || "Company")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

const safeWebsite = (value) => {
  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
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
            {value === null || value === undefined
              ? "—"
              : formatNumber(value)}
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
// COMPANY AVATAR
// ==========================================

function CompanyAvatar({ company, size = "md" }) {
  const dimensions =
    size === "lg" ? "h-16 w-16" : "h-11 w-11";

  return (
    <div
      className={`flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#5145E5]/10 font-extrabold text-[#5145E5]`}
    >
      {company.logo ? (
        <img
          src={company.logo}
          alt={company.name}
          className="h-full w-full object-contain"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className={size === "lg" ? "text-xl" : "text-sm"}>
          {getInitials(company.name)}
        </span>
      )}
    </div>
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

function VerificationBadge({ verified }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
        verified
          ? "bg-[#14E0C8]/15 text-[#087E75]"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {verified ? (
        <BadgeCheck size={13} />
      ) : (
        <ShieldAlert size={13} />
      )}

      {verified ? "Verified" : "Unverified"}
    </span>
  );
}

// ==========================================
// COMPANY DETAILS MODAL
// ==========================================

function CompanyDetailsModal({
  company,
  onClose,
  onStatusChange,
  onVerificationChange,
  updating,
  canVerify,
  supportsActivation,
  supportsVerification,
}) {
  if (!company) return null;

  const website = safeWebsite(company.website);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#18124A]/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Company details"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#18124A] via-[#34238C] to-[#5145E5] p-6 text-white">

          <div className="flex items-start justify-between gap-3">
            <div className="rounded-2xl bg-white p-1.5">
              <CompanyAvatar company={company} size="lg" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
              aria-label="Close company details"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="mt-5 text-xl font-extrabold sm:text-2xl">
            {company.name}
          </h2>

          <p className="mt-2 text-sm text-indigo-100/80">
            {company.industry || "Industry not specified"}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {supportsActivation && (
              <StatusBadge active={company.is_active} />
            )}

            {supportsVerification && (
              <VerificationBadge verified={company.is_verified} />
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="space-y-6 p-6">

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin size={15} />
                Location
              </p>

              <p className="mt-2 text-sm font-bold text-[#18124A]">
                {company.location || "Not specified"}
              </p>
            </div>

            <div>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <BriefcaseBusiness size={15} />
                Job Listings
              </p>

              <p className="mt-2 text-sm font-bold text-[#18124A]">
                {formatNumber(company.jobs_count)}
              </p>
            </div>

            <div>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <CalendarDays size={15} />
                Date Added
              </p>

              <p className="mt-2 text-sm font-bold text-[#18124A]">
                {formatDate(company.created_at)}
              </p>
            </div>

            <div>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <Globe size={15} />
                Website
              </p>

              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex max-w-full items-center gap-1.5 break-all text-sm font-bold text-[#5145E5] hover:underline"
                >
                  {company.website}
                  <ExternalLink size={14} className="shrink-0" />
                </a>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  Not provided
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-extrabold text-[#18124A]">
              About Company
            </h3>

            <p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-[#F8F9FF] p-4 text-sm leading-7 text-slate-600">
              {company.description || "No company description available."}
            </p>
          </div>

          {/* MANAGEMENT */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="mb-4 text-sm font-extrabold text-[#18124A]">
              Company Management
            </h3>

            <div className="flex flex-col gap-3 sm:flex-row">

              {supportsActivation && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => onStatusChange(company)}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
                    company.is_active
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  <Power size={17} />
                  {company.is_active
                    ? "Deactivate"
                    : "Activate"}
                </button>
              )}

              {supportsVerification && canVerify && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => onVerificationChange(company)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#5145E5]/10 px-4 py-3 text-sm font-bold text-[#5145E5] transition hover:bg-[#5145E5]/20 disabled:opacity-50"
                >
                  <BadgeCheck size={17} />

                  {company.is_verified
                    ? "Remove Verification"
                    : "Verify Company"}
                </button>
              )}
            </div>

            {!supportsVerification && (
              <p className="mt-3 text-xs text-slate-400">
                Company verification is not configured in the backend.
              </p>
            )}

            {supportsVerification && !canVerify && (
              <p className="mt-3 text-xs text-slate-400">
                Only superusers can change verification status.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPANIES PAGE
// ==========================================

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [verification, setVerification] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);

  const [selectedCompany, setSelectedCompany] = useState(null);

  const currentAdmin = getStoredAdmin();
  const canVerify = currentAdmin?.is_superuser === true;

  const supportsActivation =
    stats.supports_activation === true;

  const supportsVerification =
    stats.supports_verification === true;

  // ========================================
  // FETCH COMPANIES
  // ========================================

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminCompaniesApi.getCompanies({
        page,
        page_size: pageSize,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(verification ? { verification } : {}),
      });

      const data = response.data;

      const items = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];

      setCompanies(items);

      setTotalCount(
        typeof data.count === "number"
          ? data.count
          : items.length
      );
    } catch (err) {
      console.error("Fetch companies error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, status, verification]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminCompaniesApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error("Fetch company stats error:", err);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ========================================
  // REFRESH
  // ========================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await Promise.all([
      fetchCompanies(),
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
    setStatus("");
    setVerification("");
    setPage(1);
  };

  // ========================================
  // VIEW COMPANY
  // ========================================

  const handleViewCompany = async (company) => {
    try {
      const response = await adminCompaniesApi.getCompany(
        company.id
      );

      setSelectedCompany(response.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Unable to load company",
        text: getErrorMessage(err),
        confirmButtonColor: PURPLE,
      });
    }
  };

  // ========================================
  // UPDATE STATUS
  // ========================================

  const handleStatusChange = async (company) => {
    const nextStatus = !company.is_active;

    const result = await Swal.fire({
      title: nextStatus
        ? "Activate company?"
        : "Deactivate company?",
      text: nextStatus
        ? `Activate ${company.name}?`
        : `Deactivate ${company.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: nextStatus
        ? PURPLE
        : "#DC2626",
      confirmButtonText: nextStatus
        ? "Activate"
        : "Deactivate",
    });

    if (!result.isConfirmed) return;

    setUpdating(true);

    try {
      const response =
        await adminCompaniesApi.updateStatus(
          company.id,
          nextStatus
        );

      setSelectedCompany(response.data.company);

      await Promise.all([
        fetchCompanies(),
        fetchStats(),
      ]);

      Swal.fire({
        icon: "success",
        title: "Company updated",
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

  // ========================================
  // UPDATE VERIFICATION
  // ========================================

  const handleVerificationChange = async (company) => {
    const nextStatus = !company.is_verified;

    const result = await Swal.fire({
      title: nextStatus
        ? "Verify this company?"
        : "Remove verification?",
      text: nextStatus
        ? `Mark ${company.name} as verified?`
        : `Remove verification from ${company.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: PURPLE,
      confirmButtonText: nextStatus
        ? "Verify Company"
        : "Remove Verification",
    });

    if (!result.isConfirmed) return;

    setUpdating(true);

    try {
      const response =
        await adminCompaniesApi.updateVerification(
          company.id,
          nextStatus
        );

      setSelectedCompany(response.data.company);

      await Promise.all([
        fetchCompanies(),
        fetchStats(),
      ]);

      Swal.fire({
        icon: "success",
        title: "Verification updated",
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
      title: "Total Companies",
      value: stats.total_companies,
      icon: Building2,
    },
    {
      title: "Active Companies",
      value: stats.active_companies,
      icon: CheckCircle2,
      teal: true,
    },
    {
      title: "Inactive Companies",
      value: stats.inactive_companies,
      icon: CirclePause,
    },
    {
      title: "Verified Companies",
      value: stats.verified_companies,
      icon: BadgeCheck,
      teal: true,
    },
  ];

  return (
    <div className="space-y-6 pb-8">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18124A] via-[#34238C] to-[#5145E5] p-6 text-white shadow-xl shadow-[#5145E5]/15 sm:p-8">

        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#14E0C8]/20 blur-[70px]" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#14E0C8]/25 bg-[#14E0C8]/10 px-3 py-1.5 text-[11px] font-bold text-[#8DFFF1]">
              <ShieldCheck size={14} />
              COMPANY ADMINISTRATION
            </div>

            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Companies Management
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100/80">
              Manage registered companies, review
              employer profiles, and control company
              visibility and verification.
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

      {/* =====================================
          STATISTICS
      ===================================== */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* =====================================
          FILTERS
      ===================================== */}

      <div className="rounded-2xl border border-[#5145E5]/10 bg-white p-4 shadow-sm sm:p-5">

        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-[#5145E5]" />

          <h2 className="text-sm font-extrabold text-[#18124A]">
            Search & Filter Companies
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
                placeholder="Search company name..."
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

          {supportsActivation && (
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
          )}

          {supportsVerification && (
            <select
              value={verification}
              onChange={(event) => {
                setVerification(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-[#F8F9FF] px-4 py-3 text-sm text-[#18124A] outline-none focus:border-[#5145E5] lg:w-44"
            >
              <option value="">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          )}

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* =====================================
          COMPANIES LIST
      ===================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#5145E5]/10 bg-white shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-base font-extrabold text-[#18124A]">
              Registered Companies
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {formatNumber(totalCount)} matching companies
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
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Building2
              size={36}
              className="text-[#5145E5]/40"
            />

            <p className="mt-4 text-sm font-bold text-[#18124A]">
              No companies found
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[#F8F9FF]">
                  <tr>
                    {[
                      "Company",
                      "Industry",
                      "Jobs",
                      "Status",
                      "Verification",
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
                  {companies.map((company) => (
                    <tr
                      key={company.id}
                      className="transition hover:bg-[#F8F9FF]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <CompanyAvatar company={company} />

                          <div className="min-w-0">
                            <p className="max-w-[190px] truncate text-sm font-bold text-[#18124A]">
                              {company.name}
                            </p>

                            <p className="mt-1 max-w-[190px] truncate text-xs text-slate-400">
                              {company.location || "Location unavailable"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-slate-600">
                        {company.industry || "—"}
                      </td>

                      <td className="px-5 py-4 text-xs font-bold text-[#18124A]">
                        {formatNumber(company.jobs_count)}
                      </td>

                      <td className="px-5 py-4">
                        {supportsActivation ? (
                          <StatusBadge active={company.is_active} />
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {supportsVerification ? (
                          <VerificationBadge
                            verified={company.is_verified}
                          />
                        ) : (
                          <span className="text-xs text-slate-400">
                            Not configured
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleViewCompany(company)}
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
              {companies.map((company) => (
                <div key={company.id} className="p-4">

                  <div className="flex items-start gap-3">
                    <CompanyAvatar company={company} />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#18124A]">
                        {company.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {company.industry || "Industry not specified"}
                      </p>

                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={13} />
                        {company.location || "Unknown location"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {supportsActivation && (
                      <StatusBadge active={company.is_active} />
                    )}

                    {supportsVerification && (
                      <VerificationBadge
                        verified={company.is_verified}
                      />
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      {formatNumber(company.jobs_count)} jobs
                    </span>

                    <button
                      type="button"
                      onClick={() => handleViewCompany(company)}
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

      {/* COMPANY DETAILS MODAL */}
      {selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onStatusChange={handleStatusChange}
          onVerificationChange={handleVerificationChange}
          updating={updating}
          canVerify={canVerify}
          supportsActivation={supportsActivation}
          supportsVerification={supportsVerification}
        />
      )}
    </div>
  );
}
