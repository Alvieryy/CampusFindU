import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/apiClient";
import EmptyState from "../components/EmptyState";
import { DashboardSkeleton } from "../components/Skeleton";

// Lazily load heavy charts (416 kB) so non-admin users never download them
const AdminCharts = lazy(() => import("../components/AdminCharts"));

export default function Dashboard() {
  const { profile: authProfile, user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    lost: 0,
    found: 0,
    pendingClaims: 0,
    resolved: 0,
    resolutionRate: "0%",
  });

  const [topLocations, setTopLocations] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const profile = authProfile || {};
  const isAdmin = profile.userType === "admin";

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      // Parallel fetch with client-side SWR caching & deduplication
      const [usersRes, lostData, foundData, claimsData] = await Promise.all([
        isAdmin
          ? supabase.from("Users").select("id", { count: "exact", head: true })
          : Promise.resolve({ count: 0 }),
        apiClient.get("https://campusfindu-backend.onrender.com/api/lost-items"),
        apiClient.get("https://campusfindu-backend.onrender.com/api/found-items"),
        apiClient.get("https://campusfindu-backend.onrender.com/api/claims"),
      ]);

      let lostItems = lostData || [];
      let foundItems = foundData || [];
      let claims = claimsData || [];

      if (!isAdmin) {
        lostItems = lostItems.filter((i) => i.user_id === user.id);
        foundItems = foundItems.filter((i) => i.user_id === user.id);
        claims = claims.filter((c) => c.claimant_id === user.id || c.user_id === user.id);

        const combined = [
          ...lostItems.map((i) => ({
            type: "Lost Item",
            title: i.title,
            date: i.created_at,
            status: i.status || "Lost",
          })),
          ...foundItems.map((i) => ({
            type: "Found Item",
            title: i.title,
            date: i.created_at,
            status: i.status || "Found",
          })),
          ...claims.map((c) => ({
            type: "Claim",
            title: `Claim for Item #${c.found_item_id}`,
            date: c.created_at,
            status: c.status,
          })),
        ];
        combined.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivity(combined.slice(0, 10));
      }

      const pendingClaims = claims.filter((c) => c.status === "pending").length;
      const resolvedLost = lostItems.filter(
        (i) => i.status === "resolved" || i.status === "claimed",
      ).length;
      const resolvedFound = foundItems.filter(
        (i) => i.status === "resolved" || i.status === "claimed",
      ).length;
      const totalResolved = resolvedLost + resolvedFound;

      const totalItems = lostItems.length + foundItems.length;
      const resRate =
        totalItems > 0
          ? Math.round((totalResolved / totalItems) * 100) + "%"
          : "0%";

      const locationCounts = {};
      [...lostItems, ...foundItems].forEach((item) => {
        if (item.location_name) {
          const loc = item.location_name.trim();
          locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        }
      });

      const sortedLocations = Object.keys(locationCounts)
        .map((loc) => ({ name: loc, count: locationCounts[loc] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopLocations(sortedLocations);

      setStats({
        users: usersRes?.count || 0,
        lost: lostItems.length,
        found: foundItems.length,
        pendingClaims: pendingClaims,
        resolved: totalResolved,
        resolutionRate: resRate,
      });

      if (isAdmin) {
        setPieData([
          { name: "Lost Items", value: lostItems.length },
          { name: "Found Items", value: foundItems.length },
        ]);

        const categoryCounts = {};
        const timelineCounts = {};

        [...lostItems, ...foundItems].forEach((item) => {
          const cat = item.category || "Other";
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

          if (item.created_at) {
            const date = new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            timelineCounts[date] = (timelineCounts[date] || 0) + 1;
          }
        });

        setCategoryData(
          Object.keys(categoryCounts).map((key) => ({
            name: key,
            Total: categoryCounts[key],
          })),
        );
        setTimelineData(
          Object.keys(timelineCounts).map((date) => ({
            date,
            Reports: timelineCounts[date],
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <DashboardSkeleton isAdmin={isAdmin} />;
  }

  if (isAdmin) {
    return (
      <div className="font-sans max-w-7xl mx-auto pb-12">
        <h2 className="text-3xl font-black text-mmsu-green mb-6">
          Overview Statistics
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Total Users"
            value={stats.users}
            color="text-blue-600"
          />
          <StatCard
            title="Lost Items"
            value={stats.lost}
            color="text-red-500"
          />
          <StatCard
            title="Found Items"
            value={stats.found}
            color="text-green-500"
          />
          <StatCard
            title="Pending Claims"
            value={stats.pendingClaims}
            color="text-orange-500"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            color="text-purple-600"
          />
          <StatCard
            title="Resolution Rate"
            value={stats.resolutionRate}
            color="text-teal-500"
          />
        </div>

        <Suspense
          fallback={
            <div className="h-72 bg-white rounded-xl border border-gray-200 animate-pulse mb-8" />
          }
        >
          <AdminCharts
            timelineData={timelineData}
            topLocations={topLocations}
            categoryData={categoryData}
            pieData={pieData}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="font-sans max-w-6xl mx-auto pb-12">
      <h2 className="text-3xl font-black text-mmsu-green mb-2">
        Welcome, {profile.fullName || "Student"}!
      </h2>
      <p className="text-gray-500 mb-8">
        Here's what's happening with your reports and claims.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Lost Items Reported"
          value={stats.lost}
          color="text-red-500"
        />
        <StatCard
          title="Found Items Reported"
          value={stats.found}
          color="text-green-500"
        />
        <StatCard
          title="Pending Claims"
          value={stats.pendingClaims}
          color="text-orange-500"
        />
        <StatCard
          title="Items Claimed"
          value={stats.resolved}
          color="text-purple-600"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Most Common Hotspots (Locations)
        </h3>
        <div className="flex flex-wrap gap-4">
          {topLocations.map((loc, index) => (
            <div
              key={index}
              className="bg-red-50 border border-red-100 text-red-700 px-4 py-2 rounded-lg flex gap-3 items-center"
            >
              <span className="font-black text-xl">#{index + 1}</span>
              <div>
                <p className="font-bold">{loc.name}</p>
                <p className="text-xs">{loc.count} Reports</p>
              </div>
            </div>
          ))}
          {topLocations.length === 0 && (
            <p className="text-gray-500">Not enough data yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            Recent Activity &amp; Status
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {recentActivity.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No Activity Yet"
                description="You haven't reported any lost or found items, or submitted any claims."
                actionText="Report an Item"
                actionLink="/report-lost"
              />
            </div>
          ) : (
            recentActivity.map((act, i) => (
              <div
                key={i}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {act.type}
                  </span>
                  <p className="font-semibold text-gray-800">{act.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(act.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      act.status === "claimed" ||
                      act.status === "approved" ||
                      act.status === "found" ||
                      act.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {act.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
      <span className="text-gray-500 text-sm font-semibold mb-2">{title}</span>
      <span className={`text-4xl font-black ${color}`}>{value}</span>
    </div>
  );
}
