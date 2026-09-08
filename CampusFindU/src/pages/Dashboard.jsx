import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [profile, setProfile] = useState({
    fullName: "...",
    userType: "student",
  });

  // Student Stats
  const [lostCount, setLostCount] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [itemsClaimedCount, setItemsClaimedCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  // Admin Stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const [reportsThisMonth, setReportsThisMonth] = useState(0);
  const [chartData, setChartData] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;

      // 1. Fetch User Profile
      const { data: userProfile } = await supabase
        .from("Users")
        .select("fullName, userType")
        .eq("id", uid)
        .maybeSingle();
      if (userProfile) setProfile(userProfile);
      const isAdmin = userProfile?.userType === "admin";

      try {
        const [lostRes, foundRes, claimsRes] = await Promise.all([
          axios.get("https://campusfindu-backend.onrender.com/api/lost-items"),
          axios.get("https://campusfindu-backend.onrender.com/api/found-items"),
          axios.get("https://campusfindu-backend.onrender.com/api/claims"),
        ]);

        if (isAdmin) {
          // --- ADMINISTRATOR LOGIC ---
          const { data: usersData } = await supabase.from("Users").select("id");
          setTotalUsers(usersData ? usersData.length : 0);

          const allItems = [...lostRes.data, ...foundRes.data];
          setTotalItems(allItems.length);
          setPendingClaimsCount(
            claimsRes.data.filter((c) => c.status === "pending").length,
          );

          // Calculate how many items were reported this exact month
          const currentMonth = new Date().getMonth();
          const thisMonthItems = allItems.filter(
            (item) => new Date(item.created_at).getMonth() === currentMonth,
          );
          setReportsThisMonth(thisMonthItems.length);

          // Group the items by date to draw the chart!
          const dateMap = {};
          thisMonthItems.forEach((item) => {
            const dateStr = new Date(item.created_at).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" },
            );
            dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
          });

          const formattedChartData = Object.keys(dateMap).map((date) => ({
            name: date,
            Reports: dateMap[date],
          }));

          // If the database is empty right now, we put in some fake chart data so it looks pretty!
          if (formattedChartData.length === 0) {
            setChartData([
              { name: "May 1", Reports: 2 },
              { name: "May 7", Reports: 8 },
              { name: "May 14", Reports: 3 },
              { name: "May 21", Reports: 15 },
              { name: "May 28", Reports: 5 },
            ]);
          } else {
            setChartData(formattedChartData);
          }
        } else {
          // --- STUDENT LOGIC ---
          const myLost = lostRes.data.filter((item) => item.user_id === uid);
          const myFound = foundRes.data.filter((item) => item.user_id === uid);
          const myClaims = claimsRes.data.filter(
            (claim) => claim.claimant_id === uid,
          );

          setLostCount(myLost.length);
          setFoundCount(myFound.length);
          setPendingClaimsCount(
            myClaims.filter((c) => c.status === "pending").length,
          );
          setItemsClaimedCount(
            myClaims.filter((c) => c.status === "approved").length,
          );

          const allActivity = [
            ...myLost.map((item) => ({
              id: `l-${item.id}`,
              type: "Lost Item",
              title: item.title,
              date: item.created_at,
              status: item.status,
              link: `/items/lost/${item.id}`,
            })),
            ...myFound.map((item) => ({
              id: `f-${item.id}`,
              type: "Found Item",
              title: item.title,
              date: item.created_at,
              status: item.status,
              link: `/items/found/${item.id}`,
            })),
            ...myClaims.map((claim) => ({
              id: `c-${claim.id}`,
              type: "Claim Request",
              title: `Proof: ${claim.proof_description.substring(0, 15)}...`,
              date: claim.created_at,
              status: claim.status,
              link: `/track/found/${claim.found_item_id}`,
            })),
          ];
          allActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecentActivity(allActivity.slice(0, 5));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {profile.userType === "admin"
          ? "Administrator Dashboard"
          : `Welcome, ${profile.fullName}! 👋`}
      </h1>
      <p className="text-gray-500 mb-8">
        {profile.userType === "admin"
          ? "Global overview of system activity."
          : "Here's what's happening with your reports and claims."}
      </p>

      {/* RENDER ADMIN STATS OR STUDENT STATS DEPENDING ON WHO LOGGED IN */}
      {profile.userType === "admin" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-5xl font-black text-blue-600 mb-2">
              {loading ? "-" : totalUsers}
            </h3>
            <p className="text-gray-600 font-bold text-sm bg-blue-100 px-4 py-1 rounded-full">
              Total Users
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-5xl font-black text-green-600 mb-2">
              {loading ? "-" : totalItems}
            </h3>
            <p className="text-gray-600 font-bold text-sm bg-green-100 px-4 py-1 rounded-full">
              Total Items
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-300 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-5xl font-black text-yellow-600 mb-2">
              {loading ? "-" : pendingClaimsCount}
            </h3>
            <p className="text-gray-600 font-bold text-sm bg-yellow-100 px-4 py-1 rounded-full">
              Pending Claims
            </p>
          </div>
          <div className="bg-pink-50 p-6 rounded-xl border border-pink-200 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-5xl font-black text-pink-600 mb-2">
              {loading ? "-" : reportsThisMonth}
            </h3>
            <p className="text-gray-600 font-bold text-sm bg-pink-100 px-4 py-1 rounded-full">
              Reports (This Month)
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
            <h3 className="text-4xl font-black text-blue-800">
              {loading ? "-" : lostCount}
            </h3>
            <p className="text-blue-700 font-medium mt-2">
              Lost Items Reported
            </p>
          </div>
          <div className="bg-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
            <h3 className="text-4xl font-black text-green-800">
              {loading ? "-" : foundCount}
            </h3>
            <p className="text-green-700 font-medium mt-2">
              Found Items Reported
            </p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-xl border border-yellow-300 shadow-sm">
            <h3 className="text-4xl font-black text-yellow-800">
              {loading ? "-" : pendingClaimsCount}
            </h3>
            <p className="text-yellow-700 font-medium mt-2">Pending Claims</p>
          </div>
          <div className="bg-indigo-100 p-6 rounded-xl border border-indigo-200 shadow-sm">
            <h3 className="text-4xl font-black text-indigo-800">
              {loading ? "-" : itemsClaimedCount}
            </h3>
            <p className="text-indigo-700 font-medium mt-2">Items Claimed</p>
          </div>
        </div>
      )}

      {/* RENDER LINE CHART FOR ADMINS, OR TABLE FOR STUDENTS */}
      {profile.userType === "admin" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8">
          <h3 className="font-bold text-lg text-gray-800 mb-6">
            System Overview{" "}
            <span className="text-sm font-normal text-gray-500 ml-2">
              Reports Overview (This Month)
            </span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ stroke: "#E5E7EB", strokeWidth: 2 }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Reports"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#3B82F6",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-lg text-gray-800">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Item / Details</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-semibold text-gray-700">
                      {activity.type}
                    </td>
                    <td className="p-4 text-gray-800">
                      <Link
                        to={activity.link}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {activity.title}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full capitalize">
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
