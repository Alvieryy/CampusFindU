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

const COLORS = ["#ef4444", "#10b981", "#f59e0b", "#2563eb", "#8b5cf6"];

export default function AdminCharts({
  timelineData,
  topLocations,
  categoryData,
  pieData,
}) {
  return (
    <>
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
    </>
  );
}
