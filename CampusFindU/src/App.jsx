import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link, // <-- Added Link import!
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
import Navbar from "./components/Navbar";

import SidebarLayout from "./components/SidebarLayout";
import Dashboard from "./pages/Dashboard";

import MyItems from "./pages/MyItems";

import TrackStatus from "./pages/TrackStatus";

import ManageUsers from "./pages/ManageUsers";
import SystemSettings from "./pages/SystemSettings";
import GenerateReports from "./pages/GenerateReports";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword"; // <-- Added this

import Profile from "./pages/Profile";

// Helper component for the new Dashboard layout
function DashboardCard({ title, desc, link, icon, colorClass }) {
  return (
    <Link
      to={link}
      className={`p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col items-center text-center ${colorClass}`}
    >
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 font-medium">{desc}</p>
    </Link>
  );
}

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="p-5 text-center text-gray-500 font-sans">Loading...</div>
    );
  if (!session) return <Navigate to="/login" />;

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login key="user" />} />
        <Route path="/admin/login" element={<Login key="admin" adminOnly />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Wrap all protected routes inside the SidebarLayout! */}
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
