import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("Users")
      .select("*")
      .order("createdAt", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase
      .from("Users")
      .update({ userType: newRole })
      .eq("id", userId);
    if (error) {
      Swal.fire("Error", error.message, "error");
    } else {
      Swal.fire("Updated!", "User role changed successfully.", "success");
      fetchUsers();
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    // Assuming you have a 'status' column. If not, this is a placeholder.
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    const { error } = await supabase
      .from("Users")
      .update({ status: newStatus })
      .eq("id", userId);
    if (!error) fetchUsers();
  };

  return (
    <div className="max-w-6xl mx-auto font-sans bg-white border border-gray-200 rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email / ID</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-semibold text-gray-800">
                    {u.fullName}
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    {u.email || u.studId || u.employeeId}
                  </td>
                  <td className="p-4">
                    <select
                      value={u.userType}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="p-2 border border-gray-300 rounded outline-none cursor-pointer bg-white"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() =>
                        toggleUserStatus(u.id, u.status || "active")
                      }
                      className={`px-3 py-1 rounded-full text-sm font-bold ${u.status === "disabled" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
                    >
                      {u.status === "disabled" ? "Disabled" : "Active"}
                    </button>
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
