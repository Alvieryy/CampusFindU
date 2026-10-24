import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { supabase } from "./supabaseClient";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportLostItem from "./pages/ReportLostItem";
import LostItemsList from "./pages/LostItemsList";
import ReportFoundItem from "./pages/ReportFoundItem";
import FoundItemsList from "./pages/FoundItemsList";
import ItemDetail from "./pages/ItemDetail";
import CampusMap from "./pages/CampusMap";
import SubmitClaim from "./pages/SubmitClaim";
import AdminClaims from "./pages/AdminClaims";
import Notifications from "./pages/Notifications";
import SidebarLayout from "./components/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import MyItems from "./pages/MyItems";
import TrackStatus from "./pages/TrackStatus";
import ManageUsers from "./pages/ManageUsers";
import SystemSettings from "./pages/SystemSettings";
import GenerateReports from "./pages/GenerateReports";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import AuthCallback from "./pages/AuthCallback";

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
    </Router>
  );
}
