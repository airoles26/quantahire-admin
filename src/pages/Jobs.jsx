
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  BriefcaseBusiness,
  CheckCircle2,
  CirclePause,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Building2,
  CalendarDays,
  ExternalLink,
  AlertCircle,
  ShieldCheck,
  Power,
  Globe2,
} from "lucide-react";

import Swal from "sweetalert2";
import { adminJobsApi } from "../api/api";

const PURPLE = "#5145E5";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(value ?? 0);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;

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

// ========================================
// STAT CARD
// ========================================

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

// ========================================
// STATUS BADGE
// ========================================

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ========================================
// JOB DETAILS MODAL
// ========================================

function JobDetailsModal({
  job,
  onClose,
  onStatusChange,
  onDelete,
  updating,
  canDelete,
}) {
  if (!job) return null;

  const openApplicationUrl = () => {
    if (!job.application_url) return;

    try {
      const url = new URL(job.application_url);

      if (!["http:", "https:"].includes(url.protocol)) {
        return;
      }

      window.open(url.href, "_blank", "noopener,noreferrer");
    } catch {
      // Invalid URL: do not open it.
    }
  };

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
        aria-label="Job details"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-[#18124A] via-[#34238C] to-[#5145E5] p-6 text-white">

          <div className="flex items-start justify-between gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
              <BriefcaseBusiness size={27} />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
              aria-label="Close job details"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="mt-5 text-xl font-extrabold sm:text-2xl">
            {job.title}
          </h2>

          <p className="mt-2 text-sm text-indigo-100/80">
            {job.company_name}
          </p>

          <div className="mt-4">
            <StatusBadge active={job.is_active} />
          </div>
        </div>

        <div className="space-y-6 p-6">

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <Building2 size={15} />
                Company
              </p>

              <p className="mt-2 text-sm font-bold text-[#18124A]">
                {job.company_name}
              </p>
            </div>

            <div>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin size={15} />
                Location
              </p>

              <p className="mt-2 text-sm font-bold text-[#18124A]">
                {job.location_name}
              </p>
            </div>

            <div>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <Globe2 size={15} />
                Job Source
              </p>

              <p className="mt-2 text-sm font-bold text-[#18124A]">
                {job.source_name}
              </p>
            </div>

            <div>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                <CalendarDays size={15} />
                Discovered / Created
              </p>

              <p className="mt-2 text-sm font-bold text-[#18124A]">
                {formatDate(job.created_date)}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-extrabold text-[#18124A]">
              Job Description
            </h3>

            <div className="mt-3 max-h-60 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-[#F8F9FF] p-4 text-sm leading-7 text-slate-600">
              {job.description_text ||
                "No job description available."}
            </div>
          </div>

          {job.application_url && (
            <button
              type="button"
              onClick={openApplicationUrl}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#5145E5] hover:underline"
            >
              <ExternalLink size={17} />
              Open Application Link
            </button>
          )}

          <div className="border-t border-slate-100 pt-5">
            <h3 className="mb-4 text-sm font-extrabold text-[#18124A]">
              Job Management
            </h3>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={updating}
                onClick={() => onStatusChange(job)}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
                  job.is_active
                    ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <Power size={17} />

                {job.is_active
                  ? "Deactivate Job"
                  : "Activate Job"}
              </button>

              {canDelete && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => onDelete(job)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 size={17} />
                  Delete Job
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// MAIN JOBS PAGE
// ========================================

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);

  const [selectedJob, setSelectedJob] = useState(null);

  const currentAdmin = getStoredAdmin();
  const canDelete = currentAdmin?.is_superuser === true;

  // ========================================
  // SYNC TOPBAR SEARCH
  // ========================================

  useEffect(() => {
    const query = searchParams.get("search") || "";

    setSearchInput(query);
    setSearch(query);
    setPage(1);
  }, [searchParams]);

  // ========================================
  // FETCH JOBS
  // ========================================

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminJobsApi.getJobs({
        page,
        page_size: pageSize,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(source ? { source } : {}),
      });

      const data = response.data;

      const items = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];

      setJobs(items);

      setTotalCount(
        typeof data.count === "number"
          ? data.count
          : items.length
      );
    } catch (err) {
      console.error("Fetch jobs error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, status, source]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminJobsApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error("Fetch job stats error:", err);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ========================================
  // REFRESH
  // ========================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await Promise.all([
      fetchJobs(),
      fetchStats(),
    ]);

    setRefreshing(false);
  };

  // ========================================
  // SEARCH
  // ========================================

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchInput.trim();

    setPage(1);
    setSearch(query);

    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setSource("");
    setPage(1);
    setSearchParams({});
  };

  // ========================================
  // VIEW JOB
  // ========================================

  const handleViewJob = async (job) => {
    try {
      const response = await adminJobsApi.getJob(job.id);
      setSelectedJob(response.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Unable to load job",
        text: getErrorMessage(err),
        confirmButtonColor: PURPLE,
      });
    }
  };

  // ========================================
  // UPDATE STATUS
  // ========================================

  const handleStatusChange = async (job) => {
    const nextStatus = !job.is_active;

    const result = await Swal.fire({
      title: nextStatus
        ? "Activate this job?"
        : "Deactivate this job?",
      text: nextStatus
        ? "This job will become available again."
        : "This job will be hidden from active job listings.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: PURPLE,
      confirmButtonText: nextStatus
        ? "Activate"
        : "Deactivate",
    });

    if (!result.isConfirmed) return;

    setUpdating(true);

    try {
      const response = await adminJobsApi.updateStatus(
        job.id,
        nextStatus
      );

      const updatedJob = response.data.job;

      setSelectedJob(updatedJob);

      await Promise.all([
        fetchJobs(),
        fetchStats(),
      ]);

      Swal.fire({
        icon: "success",
        title: "Job updated",
        text: response.data.message,
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
  // DELETE JOB
  // ========================================

  const handleDeleteJob = async (job) => {
    const result = await Swal.fire({
      title: "Delete this job?",
      text: `"${job.title}" will be permanently removed. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    setUpdating(true);

    try {
      await adminJobsApi.deleteJob(job.id);

      setSelectedJob(null);

      await Promise.all([
        fetchJobs(),
        fetchStats(),
      ]);

      Swal.fire({
        icon: "success",
        title: "Job deleted",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
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
      title: "Total Jobs",
      value: stats.total_jobs,
      icon: BriefcaseBusiness,
    },
    {
      title: "Active Jobs",
      value: stats.active_jobs,
      icon: CheckCircle2,
      teal: true,
    },
    {
      title: "Inactive Jobs",
      value: stats.inactive_jobs,
      icon: CirclePause,
    },
    {
      title: "Job Sources",
      value: stats.sources?.length ?? 0,
      icon: Globe2,
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
              JOB ADMINISTRATION
            </div>

            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Jobs Management
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100/80">
              Monitor imported and employer-posted jobs,
              manage listing visibility, and maintain
              the quality of opportunities on Quantahire.
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
            Search & Filter Jobs
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
                placeholder="Search title, company or location..."
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

          <select
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-[#F8F9FF] px-4 py-3 text-sm text-[#18124A] outline-none focus:border-[#5145E5] lg:w-44"
          >
            <option value="">All Sources</option>

            {(stats.sources || [])
              .filter((item) => item.source)
              .map((item) => (
                <option
                  key={item.source}
                  value={item.source}
                >
                  {item.source} ({item.total})
                </option>
              ))}
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
          JOBS TABLE
      ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#5145E5]/10 bg-white shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-base font-extrabold text-[#18124A]">
              Job Listings
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {formatNumber(totalCount)} matching jobs
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
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <BriefcaseBusiness
              size={36}
              className="text-[#5145E5]/40"
            />

            <p className="mt-4 text-sm font-bold text-[#18124A]">
              No jobs found
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Try changing your search or filters.
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
                      "Job",
                      "Company",
                      "Source",
                      "Status",
                      "Date",
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
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="transition hover:bg-[#F8F9FF]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5145E5]/10 text-[#5145E5]">
                            <BriefcaseBusiness size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[230px] truncate text-sm font-bold text-[#18124A]">
                              {job.title}
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                              <MapPin size={12} />
                              <span className="max-w-[200px] truncate">
                                {job.location_name}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-slate-600">
                        {job.company_name}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[#5145E5]/5 px-3 py-1 text-[11px] font-semibold text-[#5145E5]">
                          {job.source_name}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge active={job.is_active} />
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formatDate(job.created_date)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleViewJob(job)}
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
              {jobs.map((job) => (
                <div key={job.id} className="p-4">

                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5145E5]/10 text-[#5145E5]">
                      <BriefcaseBusiness size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#18124A]">
                        {job.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {job.company_name}
                      </p>

                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={13} />
                        {job.location_name}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusBadge active={job.is_active} />

                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                      {job.source_name}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      {formatDate(job.created_date)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleViewJob(job)}
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

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteJob}
          updating={updating}
          canDelete={canDelete}
        />
      )}
    </div>
  );
}
