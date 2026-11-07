
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import axios from "axios";
import quantahireLogo from "../assets/logo.png";

const API_BASE_URL = (
  import.meta.env.API_URL ||
  "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

// ========================================
// ADMIN ROLE CHECK
// ========================================

const isAdmin = (user) => {
  return (
    user?.role?.toLowerCase() === "admin" ||
    user?.is_staff === true ||
    user?.is_superuser === true
  );
};

// ========================================
// LOGIN COMPONENT
// ========================================

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // INPUT HANDLER
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // ========================================
  // LOGIN HANDLER
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      // 1. Authenticate user
      const response = await axios.post(
        `${API_BASE_URL}/auth/signin/`,
        {
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }
      );

      const data = response.data;

      // 2. Extract JWT tokens
      const accessToken =
        data.access_token ||
        data.tokens?.access ||
        data.access;

      const refreshToken =
        data.refresh_token ||
        data.tokens?.refresh ||
        data.refresh;

      if (!accessToken) {
        setError(
          "Login succeeded, but no access token was returned."
        );
        return;
      }

      // 3. Fetch authenticated user
      const profileResponse = await axios.get(
        `${API_BASE_URL}/auth/me/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const profileData = profileResponse.data;
      const user = profileData.user || profileData;

      // 4. Verify administrator privileges
      if (!isAdmin(user)) {
        setError(
          "Access denied. This portal is restricted to Quantahire administrators."
        );
        return;
      }

      // 5. Save session
      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      const otherStorage = rememberMe
        ? sessionStorage
        : localStorage;

      // Clear any previous session
      ["access", "refresh", "user"].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      storage.setItem("access", accessToken);

      if (refreshToken) {
        storage.setItem("refresh", refreshToken);
      }

      storage.setItem("user", JSON.stringify(user));

      // 6. Redirect to dashboard
      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      console.error("Admin login error:", err);

      const data = err.response?.data;

      if (data?.email_verification_required) {
        setError(
          "Your email is not verified. Please verify your account before signing in."
        );
      } else {
        setError(
          data?.message ||
          data?.detail ||
          "Unable to sign in. Please check your credentials."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-[#F8F9FF] lg:grid lg:grid-cols-2">

      {/* =====================================
          LEFT BRANDING PANEL
      ===================================== */}

      <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#18124A] px-12 py-12 text-white lg:flex xl:px-20">

        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#211766] via-[#34238C] to-[#5145E5]" />

        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full bg-[#14E0C8]/20 blur-[100px]" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[450px] w-[450px] rounded-full bg-[#8B7BFF]/30 blur-[110px]" />

        {/* Logo */}
        <div className="relative z-10 inline-flex w-fit items-center rounded-xl bg-white px-4 py-2 shadow-xl">
          <img
            src={quantahireLogo}
            alt="Quantahire"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Branding content */}
        <div className="relative z-10 max-w-xl py-14">

          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#14E0C8]/30 bg-[#14E0C8]/10 px-4 py-2 text-xs font-semibold tracking-wide text-[#6FFFEF]">
            <Sparkles size={15} />
            QUANTAHIRE ADMINISTRATION
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.13] tracking-tight xl:text-6xl">
            Manage your
            <span className="mt-2 block">
              platform with
            </span>
            <span className="mt-2 block bg-gradient-to-r from-[#14E0C8] via-[#7CFBEA] to-white bg-clip-text text-transparent">
              confidence.
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-base leading-8 text-indigo-100/80">
            Welcome to the Quantahire administration
            workspace. Manage users, companies, jobs,
            applications, and platform performance
            from one secure dashboard.
          </p>

          <div className="mt-10 space-y-5">
            {[
              "Manage candidates and employers",
              "Monitor jobs and applications",
              "Track platform growth and analytics",
              "Control subscriptions and payments",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#14E0C8]/20 bg-[#14E0C8]/10 text-[#14E0C8]">
                  <CheckCircle2 size={19} />
                </div>

                <span className="text-sm font-medium text-indigo-50/90">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Security card */}
          <div className="mt-12 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14E0C8]/15 text-[#14E0C8]">
                <ShieldCheck size={23} />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  Secure Administration
                </p>

                <p className="mt-1 text-xs text-indigo-100/70">
                  Authorized personnel only
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-indigo-100/80">
              Administrative access is restricted to
              authorized Quantahire team members.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-indigo-200/70">
          © {new Date().getFullYear()} Quantahire.
          All rights reserved.
        </div>
      </aside>

      {/* =====================================
          RIGHT LOGIN PANEL
      ===================================== */}

      <main className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-10 lg:px-12">

        {/* Background decoration */}
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[#5145E5]/5 blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#14E0C8]/5 blur-3xl" />

        <div className="relative z-10 w-full max-w-[440px]">

          {/* Mobile logo */}
          <div className="mb-10 inline-flex items-center lg:hidden">
            <img
              src={quantahireLogo}
              alt="Quantahire"
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <div className="mb-9">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#5145E5]/10 bg-[#5145E5]/5 px-3.5 py-1.5 text-xs font-bold text-[#5145E5]">
              <ShieldCheck size={14} />
              ADMIN PORTAL
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-[#18124A] sm:text-4xl">
              Welcome back,
              <span className="block bg-gradient-to-r from-[#5145E5] to-[#16BFAF] bg-clip-text text-transparent">
                Administrator
              </span>
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Enter your administrator credentials to
              access the Quantahire management dashboard.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {/* Login form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2.5 block text-sm font-semibold text-[#18124A]"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5145E5]/60"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@quantahire.tech"
                  autoComplete="email"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm text-slate-900 outline-none transition hover:border-indigo-200 focus:border-[#5145E5] focus:ring-4 focus:ring-[#5145E5]/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2.5 block text-sm font-semibold text-[#18124A]"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5145E5]/60"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-sm text-slate-900 outline-none transition hover:border-indigo-200 focus:border-[#5145E5] focus:ring-4 focus:ring-[#5145E5]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#5145E5]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex cursor-pointer items-center gap-2.5 py-1">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                className="h-4 w-4 cursor-pointer accent-[#5145E5]"
              />

              <span className="text-sm text-slate-600">
                Keep me signed in
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5145E5] to-[#695CF0] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#5145E5]/20 transition-all hover:-translate-y-0.5 hover:from-[#4338CA] hover:to-[#5145E5] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Admin Console
                  <ArrowRight
                    size={19}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Security footer */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck
              size={16}
              className="text-[#16BFAF]"
            />
            Secure Quantahire Administration
          </div>

          <p className="mt-10 text-center text-xs text-slate-400 lg:hidden">
            © {new Date().getFullYear()} Quantahire.
            All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
