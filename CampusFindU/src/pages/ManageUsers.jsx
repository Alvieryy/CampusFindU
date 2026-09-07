import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all users directly from the database!
    supabase
      .from("Users")
      .select("*")
      .then(({ data }) => {
        setUsers(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto font-sans bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
        <button className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition">
          Add New User
        </button>
      </div>

      <div className="mb-6 relative">
        <span className="absolute left-4 top-3 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
            <tr>
              <th className="p-4 font-medium">User ID</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="p-4 text-gray-500 text-sm">
                    USR-{(i + 1).toString().padStart(4, "0")}
                  </td>
                  <td className="p-4 font-semibold text-gray-800">
                    {u.fullName}
                  </td>
                  <td className="p-4 text-gray-600 capitalize">{u.userType}</td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
