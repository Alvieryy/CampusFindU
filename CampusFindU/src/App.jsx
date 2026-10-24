import { useEffect, useState, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { supabase } from "./supabaseClient";
import SidebarLayout from "./components/SidebarLayout";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ReportLostItem = lazy(() => import("./pages/ReportLostItem"));
const LostItemsList = lazy(() => import("./pages/LostItemsList"));
const ReportFoundItem = lazy(() => import("./pages/ReportFoundItem"));
const FoundItemsList = lazy(() => import("./pages/FoundItemsList"));
const ItemDetail = lazy(() => import("./pages/ItemDetail"));
const CampusMap = lazy(() => import("./pages/CampusMap"));
const SubmitClaim = lazy(() => import("./pages/SubmitClaim"));
const AdminClaims = lazy(() => import("./pages/AdminClaims"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyItems = lazy(() => import("./pages/MyItems"));
const TrackStatus = lazy(() => import("./pages/TrackStatus"));
const ManageUsers = lazy(() => import("./pages/ManageUsers"));
const SystemSettings = lazy(() => import("./pages/SystemSettings"));
const GenerateReports = lazy(() => import("./pages/GenerateReports"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

function PageLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page content"
      className="max-w-7xl mx-auto p-4 md:p-8 animate-pulse font-sans space-y-6"
    >
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded-lg w-56" />
        <div className="h-4 bg-gray-150 rounded w-80 max-w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
          >
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-48 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let authChanged = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authChanged = true;

      if (active) {
        setSession(nextSession);
        setLoading(false);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active || authChanged) return;

        setSession(error ? null : data.session);
        setLoading(false);
      })
      .catch(() => {
        if (!active || authChanged) return;

        setSession(null);
        setLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div role="status" className="p-5 text-center font-sans text-gray-500">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login key="user" />} />

          <Route path="/admin/login" element={<Login key="admin" adminOnly />} />

          <Route path="/guest/login" element={<Login key="guest" guestOnly />} />

          <Route path="/register" element={<Register key="regular-register" />} />

          <Route
            path="/guest/register"
            element={<Register key="guest-register" guestOnly />}
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/report-lost" element={<ReportLostItem />} />

                    <Route path="/report-found" element={<ReportFoundItem />} />

                    <Route path="/lost-items" element={<LostItemsList />} />

                    <Route path="/found-items" element={<FoundItemsList />} />

                    <Route
                      path="/items/lost/:id"
                      element={<ItemDetail type="lost" />}
                    />

                    <Route
                      path="/items/found/:id"
                      element={<ItemDetail type="found" />}
                    />

                    <Route path="/campus-map" element={<CampusMap />} />

                    <Route path="/claim/:id" element={<SubmitClaim />} />

                    <Route path="/admin/claims" element={<AdminClaims />} />

                    <Route path="/notifications" element={<Notifications />} />

                    <Route path="/my-items" element={<MyItems />} />

                    <Route path="/track/:type/:id" element={<TrackStatus />} />

                    <Route path="/admin/users" element={<ManageUsers />} />

                    <Route path="/admin/settings" element={<SystemSettings />} />

                    <Route path="/admin/reports" element={<GenerateReports />} />

                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}
