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
      className="flex min-h-[50vh] items-center justify-center p-8 font-sans text-sm font-semibold text-gray-500"
    >
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-mmsu-green border-t-transparent" />
        <span>Loading...</span>
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
