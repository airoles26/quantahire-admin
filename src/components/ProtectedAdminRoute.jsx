
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import { LoaderCircle, ShieldCheck } from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
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
// CLEAR AUTHENTICATION
// ========================================

const clearAuth = () => {
  ["access", "refresh", "user"].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

// ========================================
// PROTECTED ADMIN ROUTE
// ========================================

export default function ProtectedAdminRoute() {
  const location = useLocation();

  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    const verifyAdmin = async () => {
      const token =
        localStorage.getItem("access") ||
        sessionStorage.getItem("access");

      if (!token) {
        if (active) setStatus("unauthenticated");
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/auth/me/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profileData = response.data;
        const user = profileData.user || profileData;

        if (!isAdmin(user)) {
          clearAuth();

          if (active) {
            setStatus("unauthorized");
          }

          return;
        }

        const storage =
          localStorage.getItem("access") === token
            ? localStorage
            : sessionStorage;

        storage.setItem("user", JSON.stringify(user));

        if (active) {
          setStatus("authorized");
        }
      } catch (error) {
        console.error("Admin verification failed:", error);

        // Only clear credentials when backend rejects them.
        if ([401, 403].includes(error.response?.status)) {
          clearAuth();
        }

        if (active) {
          setStatus(
            [401, 403].includes(error.response?.status)
              ? "unauthenticated"
              : "error"
          );
        }
      }
    };

    verifyAdmin();

    return () => {
      active = false;
    };
  }, []);

  // ========================================
  // LOADING
  // ========================================

  if (status === "checking") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FF]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5145E5]/10">
          <ShieldCheck
            size={30}
            className="text-[#5145E5]"
          />
        </div>

        <LoaderCircle
          size={28}
          className="mt-6 animate-spin text-[#5145E5]"
        />

        <p className="mt-4 text-sm font-semibold text-[#18124A]">
          Verifying administrator access...
        </p>

        <p className="mt-2 text-xs text-slate-400">
          Please wait a moment.
        </p>
      </div>
    );
  }

  // ========================================
  // NOT AUTHENTICATED
  // ========================================

  if (
    status === "unauthenticated" ||
    status === "unauthorized"
  ) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // ========================================
  // NETWORK ERROR
  // ========================================

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FF] px-5 text-center">
        <ShieldCheck
          size={38}
          className="text-[#5145E5]"
        />

        <h2 className="mt-5 text-xl font-bold text-[#18124A]">
          Unable to verify your session
        </h2>

        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Please check your connection and try again.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-[#5145E5] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4338CA]"
        >
          Retry
        </button>
      </div>
    );
  }

  // ========================================
  // AUTHORIZED
  // ========================================

  return <Outlet />;
}
