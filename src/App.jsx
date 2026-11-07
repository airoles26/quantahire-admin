
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
// import Jobs from "./pages/Jobs";
// import Companies from "./pages/Companies";
// import Applications from "./pages/Applications";
// import Payments from "./pages/Payments";
// import Subscriptions from "./pages/Subscriptions";
// import Analytics from "./pages/Analytics";
// import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* PROTECTED ADMIN ROUTES */}
        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>

            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/users"
              element={<Users />}
            />

            {/* <Route
              path="/jobs"
              element={<Jobs />}
            />

            <Route
              path="/companies"
              element={<Companies />}
            />

            <Route
              path="/applications"
              element={<Applications />}
            />

            <Route
              path="/payments"
              element={<Payments />}
            />

            <Route
              path="/subscriptions"
              element={<Subscriptions />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            /> */}

          </Route>
        </Route>

        {/* UNKNOWN ROUTES */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
