import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [profile, setProfile] = useState({});
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

  const COLORS = ["#ef4444", "#10b981", "#f59e0b", "#2563eb", "#8b5cf6"];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { data: userData } = await supabase
      .from("Users")
      .select("*")
      .eq("id", session.user.id)
      .single();
    setProfile(userData || {});

    try {
      const [usersRes, lostRes, foundRes, claimsRes] = await Promise.all([
        userData?.userType === "admin"
          ? supabase.from("Users").select("id", { count: "exact" })
          : Promise.resolve({ count: 0 }),
        axios.get("https://campusfindu-backend.onrender.com/api/lost-items"),
        axios.get("https://campusfindu-backend.onrender.com/api/found-items"),
        axios.get("https://campusfindu-backend.onrender.com/api/claims"),
      ]);

      let lostItems = lostRes.data || [];
      let foundItems = foundRes.data || [];
      let claims = claimsRes.data || [];

      // ==========================================
      // STUDENT DATA LOGIC
      // ==========================================
      if (userData?.userType !== "admin") {
        lostItems = lostItems.filter((i) => i.user_id === session.user.id);
        foundItems = foundItems.filter((i) => i.user_id === session.user.id);
        claims = claims.filter((c) => c.user_id === session.user.id);

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

      // Math for Stats Cards
      const pendingClaims = claims.filter((c) => c.status === "pending").length;
      const resolvedLost = lostItems.filter(
        (i) => i.status === "resolved" || i.status === "claimed",
      ).length;
      const resolvedFound = foundItems.filter(
        (i) => i.status === "resolved" || i.status === "claimed",
      ).length;
      const totalResolved = resolvedLost + resolvedFound;

      // ==========================================
      // PHASE 12 MATH (Resolution Rate & Locations)
      // ==========================================
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
        users: usersRes.count || 0,
        lost: lostItems.length,
        found: foundItems.length,
        pendingClaims: pendingClaims,
        resolved: totalResolved,
        resolutionRate: resRate,
      });

      // ==========================================
      // ADMIN CHARTS LOGIC
      // ==========================================
      if (userData?.userType === "admin") {
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
      console.error("Error fetching stats:", error);
    }

    setLoading(false);
  };

  if (loading)
    return (
      <div className="p-8 text-gray-500 font-bold">Loading Dashboard...</div>
    );

  // ==========================================
  // ADMIN DASHBOARD VIEW
  // ==========================================
  if (profile.userType === "admin") {
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Reports Over Time
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip cursor={{ fill: "#f3f4f6" }} />
                <Line
                  type="monotone"
                  dataKey="Reports"
                  stroke="#8b5cf6"
                  strokeWidth={4}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Most Reported Categories
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip cursor={{ fill: "#f3f4f6" }} />
                  <Bar dataKey="Total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Lost vs Found Ratio
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STUDENT DASHBOARD VIEW
  // ==========================================
  return (
    <div className="font-sans max-w-6xl mx-auto pb-12">
      <h2 className="text-3xl font-black text-mmsu-green mb-2">
        Welcome, {profile.fullName}!
      </h2>
      <p className="text-gray-500 mb-8">
        Here's what's happening with your reports and claims.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StudentCard
          count={stats.lost}
          label="Lost Items Reported"
          bgColor="bg-blue-100"
          textColor="text-blue-800"
        />
        <StudentCard
          count={stats.found}
          label="Found Items Reported"
          bgColor="bg-green-100"
          textColor="text-green-800"
        />
        <StudentCard
          count={stats.pendingClaims}
          label="Pending Claims"
          bgColor="bg-yellow-100"
          textColor="text-yellow-800"
        />
        <StudentCard
          count={stats.resolved}
          label="Items Claimed"
          bgColor="bg-indigo-100"
          textColor="text-indigo-800"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Item / Details</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No recent activity.
                  </td>
                </tr>
              ) : (
                recentActivity.map((act, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-semibold text-gray-700">
                      {act.type}
                    </td>
                    <td className="p-4 text-gray-600">{act.title}</td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(act.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full capitalize">
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------
// HELPER COMPONENTS
// ----------------------------------------
function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center transition hover:shadow-md">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">
        {title}
      </p>
      <p className={`text-4xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function StudentCard({ count, label, bgColor, textColor }) {
  return (
    <div
      className={`${bgColor} ${textColor} p-6 rounded-lg border border-black/5 shadow-sm flex flex-col justify-center`}
    >
      <h3 className="text-3xl font-black mb-1">{count}</h3>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
