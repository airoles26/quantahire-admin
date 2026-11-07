
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserRound,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CirclePause,
  UserPlus,
  RefreshCw,
  ArrowUpRight,
  Activity,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  ChartNoAxesCombined,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { adminDashboardApi } from "../api/api";

// ========================================
// COLORS
// ========================================

const COLORS = {
  purple: "#5145E5",
  darkPurple: "#18124A",
  teal: "#14E0C8",
  inactive: "#D8D6EB",
};

// ========================================
// HELPERS
// ========================================

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

const getInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase() || "U";

// ========================================
// STAT CARD
// ========================================

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color = "purple",
}) {
  const isTeal = color === "teal";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#5145E5]/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#5145E5]/10 sm:p-6">

      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${
          isTeal
            ? "bg-[#14E0C8]/10"
            : "bg-[#5145E5]/10"
        }`}
      />

      <div className="relative flex items-start justify-between gap-3">

        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">
            {title}
          </p>

          <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-[#18124A] sm:text-3xl">
            {formatNumber(value)}
          </h3>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            isTeal
              ? "bg-[#14E0C8]/15 text-[#0A9D91]"
              : "bg-[#5145E5]/10 text-[#5145E5]"
          }`}
        >
          <Icon size={23} strokeWidth={2} />
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-2">
        <ArrowUpRight
          size={15}
          className={isTeal ? "text-[#0A9D91]" : "text-[#5145E5]"}
        />

        <span className="text-xs text-slate-400">
          {description}
        </span>
      </div>
    </div>
  );
}

// ========================================
// SECTION HEADING
// ========================================

function SectionHeading({ title, subtitle, icon: Icon }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5145E5]/10 text-[#5145E5]">
          <Icon size={19} />
        </div>
      )}

      <div>
        <h2 className="text-base font-extrabold text-[#18124A] sm:text-lg">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ========================================
// CUSTOM CHART TOOLTIP
// ========================================

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-[#5145E5]/10 bg-white p-3 shadow-xl">
      <p className="mb-2 text-xs font-bold text-[#18124A]">
        {label}
      </p>

      {payload.map((item) => (
        <p
          key={item.dataKey}
          className="mt-1 text-xs font-medium"
          style={{ color: item.color }}
        >
          {item.name}: {formatNumber(item.value)}
        </p>
      ))}
    </div>
  );
}

// ========================================
// MONTHLY ANALYTICS CHART
// ========================================

function AnalyticsChart({ data }) {
  return (
    <div className="rounded-2xl border border-[#5145E5]/10 bg-white p-5 shadow-sm sm:p-6">

      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title="Platform Growth"
          subtitle="User registrations and discovered jobs over the last 6 months"
          icon={ChartNoAxesCombined}
        />

        <span className="rounded-full bg-[#5145E5]/5 px-3 py-1.5 text-xs font-bold text-[#5145E5]">
          Last 6 months
        </span>
      </div>

      <div className="h-[300px] w-full sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 5,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="usersGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={COLORS.purple}
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor={COLORS.purple}
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="jobsGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={COLORS.teal}
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor={COLORS.teal}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#F0EFF9"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{
                fontSize: 11,
                fill: "#94A3B8",
              }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fontSize: 11,
                fill: "#94A3B8",
              }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<ChartTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              height={40}
              wrapperStyle={{
                fontSize: 12,
              }}
            />

            <Area
              type="monotone"
              dataKey="users"
              name="New Users"
              stroke={COLORS.purple}
              strokeWidth={3}
              fill="url(#usersGradient)"
              dot={false}
              activeDot={{ r: 5 }}
            />

            <Area
              type="monotone"
              dataKey="jobs"
              name="New Jobs"
              stroke={COLORS.teal}
              strokeWidth={3}
              fill="url(#jobsGradient)"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ========================================
// JOB STATUS CHART
// ========================================

function JobStatusChart({ overview }) {
  const active = overview?.active_jobs ?? 0;
  const inactive = overview?.inactive_jobs ?? 0;

  const total = active + inactive;

  const data = [
    {
      name: "Active Jobs",
      value: active,
      color: COLORS.purple,
    },
    {
      name: "Inactive Jobs",
      value: inactive,
      color: COLORS.inactive,
    },
  ];

  return (
    <div className="rounded-2xl border border-[#5145E5]/10 bg-white p-5 shadow-sm sm:p-6">

      <SectionHeading
        title="Job Status"
        subtitle="Current distribution of platform jobs"
        icon={BriefcaseBusiness}
      />

      {total > 0 ? (
        <>
          <div className="relative mt-4 h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-extrabold text-[#18124A]">
                {formatNumber(total)}
              </p>

              <p className="text-xs text-slate-400">
                Total Jobs
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />

                  <span className="text-xs font-medium text-slate-500">
                    {item.name}
                  </span>
                </div>

                <span className="text-xs font-bold text-[#18124A]">
                  {formatNumber(item.value)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-[290px] items-center justify-center text-center text-sm text-slate-400">
          No jobs available yet.
        </div>
      )}
    </div>
  );
}

// ========================================
// RECENT USERS
// ========================================

function RecentUsers({ users, navigate }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#5145E5]/10 bg-white shadow-sm">

      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
        <SectionHeading
          title="Recent Users"
          subtitle="Latest registered platform users"
          icon={Users}
        />

        <button
          onClick={() => navigate("/users")}
          className="shrink-0 text-xs font-bold text-[#5145E5] hover:underline"
        >
          View All
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {users.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">
            No users found.
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-5 py-4 transition hover:bg-[#F8F9FF] sm:px-6"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5145E5]/10 text-xs font-extrabold text-[#5145E5]">
                {getInitials(user.name)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#18124A]">
                  {user.name || "User"}
                </p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {user.email || "No email"}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span className="inline-flex rounded-full bg-[#5145E5]/5 px-2.5 py-1 text-[10px] font-bold capitalize text-[#5145E5]">
                  {user.role || "user"}
                </span>

                <p className="mt-1.5 text-[10px] text-slate-400">
                  {formatDate(user.date_joined)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ========================================
// RECENT JOBS
// ========================================

function RecentJobs({ jobs, navigate }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#5145E5]/10 bg-white shadow-sm">

      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
        <SectionHeading
          title="Recent Jobs"
          subtitle="Latest discovered job opportunities"
          icon={BriefcaseBusiness}
        />

        <button
          onClick={() => navigate("/jobs")}
          className="shrink-0 text-xs font-bold text-[#5145E5] hover:underline"
        >
          View All
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {jobs.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">
            No jobs found.
          </p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-3 px-5 py-4 transition hover:bg-[#F8F9FF] sm:px-6"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#14E0C8]/15 text-[#0A9D91]">
                <BriefcaseBusiness size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#18124A]">
                  {job.title}
                </p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {job.company}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    job.is_active
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {job.is_active ? "Active" : "Inactive"}
                </span>

                <p className="mt-1.5 text-[10px] text-slate-400">
                  {formatDate(job.posted_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ========================================
// DASHBOARD SKELETON
// ========================================

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-24 rounded-2xl bg-white" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-2xl bg-white"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="h-96 rounded-2xl bg-white xl:col-span-2" />
        <div className="h-96 rounded-2xl bg-white" />
      </div>
    </div>
  );
}

// ========================================
// MAIN DASHBOARD
// ========================================

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await adminDashboardApi.getDashboard();

      setDashboard(response.data);
    } catch (err) {
      console.error("Dashboard API error:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else if (err.response?.status === 403) {
        setError("You do not have administrator permission.");
      } else {
        setError(
          err.response?.data?.detail ||
          "Unable to load dashboard data. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const overview = dashboard?.overview || {};

  const cards = [
    {
      title: "Total Users",
      value: overview.total_users,
      icon: Users,
      description: "Registered accounts",
    },
    {
      title: "Candidates",
      value: overview.total_candidates,
      icon: UserRound,
      description: "Job-seeking users",
      color: "teal",
    },
    {
      title: "Employers",
      value: overview.total_employers,
      icon: ShieldCheck,
      description: "Employer accounts",
    },
    {
      title: "New Users (30 Days)",
      value: overview.new_users_30_days,
      icon: UserPlus,
      description: "Recently registered",
      color: "teal",
    },
    {
      title: "Total Jobs",
      value: overview.total_jobs,
      icon: BriefcaseBusiness,
      description: "All job listings",
    },
    {
      title: "Active Jobs",
      value: overview.active_jobs,
      icon: CheckCircle2,
      description: "Currently available",
      color: "teal",
    },
    {
      title: "Inactive Jobs",
      value: overview.inactive_jobs,
      icon: CirclePause,
      description: "Deactivated listings",
    },
    {
      title: "Companies",
      value: overview.total_companies,
      icon: Building2,
      description: `${formatNumber(overview.active_companies)} active companies`,
      color: "teal",
    },
  ];

  if (loading && !dashboard) {
    return <DashboardSkeleton />;
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-white p-8 text-center">
        <AlertCircle size={36} className="text-red-500" />

        <h2 className="mt-4 text-lg font-bold text-[#18124A]">
          Unable to load dashboard
        </h2>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          {error}
        </p>

        <button
          onClick={() => fetchDashboard()}
          className="mt-5 rounded-xl bg-[#5145E5] px-5 py-3 text-sm font-bold text-white hover:bg-[#4338CA]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-6">

      {/* =====================================
          WELCOME HEADER
      ===================================== */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18124A] via-[#34238C] to-[#5145E5] p-6 text-white shadow-xl shadow-[#5145E5]/15 sm:p-8">

        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#14E0C8]/20 blur-[70px]" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#8B7BFF]/25 blur-[80px]" />

        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#14E0C8]/25 bg-[#14E0C8]/10 px-3 py-1.5 text-[11px] font-bold text-[#8DFFF1]">
              <Activity size={14} />
              PLATFORM OVERVIEW
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome to Quantahire Admin
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100/80">
              Monitor your platform, manage job opportunities,
              and track growth from one central workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/15 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/25 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* REFRESH ERROR */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* =====================================
          OVERVIEW CARDS
      ===================================== */}

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <SectionHeading
            title="Platform Statistics"
            subtitle="A snapshot of your Quantahire platform"
            icon={Activity}
          />

          <span className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-500">
            <CalendarDays size={15} className="text-[#5145E5]" />
            {new Date().toLocaleDateString("en-KE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </div>

      {/* =====================================
          ANALYTICS
      ===================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <AnalyticsChart
            data={dashboard.monthly_analytics || []}
          />
        </div>

        <div className="min-w-0">
          <JobStatusChart overview={overview} />
        </div>
      </div>

      {/* =====================================
          RECENT ACTIVITY
      ===================================== */}

      <div>
        <div className="mb-5">
          <SectionHeading
            title="Recent Activity"
            subtitle="Latest users and job listings"
            icon={Activity}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RecentUsers
            users={dashboard.recent_users || []}
            navigate={navigate}
          />

          <RecentJobs
            jobs={dashboard.recent_jobs || []}
            navigate={navigate}
          />
        </div>
      </div>

      {/* =====================================
          FINANCE / APPLICATIONS STATUS
      ===================================== */}

      <div className="grid gap-5 md:grid-cols-2">

        <div className="rounded-2xl border border-[#5145E5]/10 bg-white p-5 sm:p-6">
          <SectionHeading
            title="Applications"
            subtitle="Application analytics integration"
            icon={Users}
          />

          <p className="mt-5 text-sm leading-6 text-slate-500">
            Application statistics will appear here once
            the application model and API are connected.
          </p>
        </div>

        <div className="rounded-2xl border border-[#5145E5]/10 bg-white p-5 sm:p-6">
          <SectionHeading
            title="Financial Overview"
            subtitle="Payments and subscriptions"
            icon={ChartNoAxesCombined}
          />

          <p className="mt-5 text-sm leading-6 text-slate-500">
            Revenue and payment statistics will appear
            here once the payment models are connected.
          </p>
        </div>
      </div>
    </div>
  );
}
