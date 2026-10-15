import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setLoadError("");
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .order("createdAt", { ascending: false });
    if (error) setLoadError(error.message);
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

  const handleDeleteUser = async (userId, fullName) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: `Are you sure you want to permanently delete ${fullName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("Users").delete().eq("id", userId);
      if (error) {
        Swal.fire("Error", error.message, "error");
      } else {
        Swal.fire("Deleted!", `${fullName} has been removed.`, "success");
        fetchUsers();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto font-sans bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="min-h-11 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-mmsu-green hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {loadError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {loadError}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="block md:table w-full text-left">
          <thead className="hidden md:table-header-group bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Contact Details / ID</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  {loadError ? "Unable to load users." : "No users found."}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="block md:table-row mb-4 md:mb-0 rounded-xl md:rounded-none border md:border-0 md:border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="block md:table-cell p-4">
                    <div className="font-semibold text-gray-800">
                      {u.fullName}
                    </div>
                    <div className="mt-1">
                      {u.is_online ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          Offline
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="block md:table-cell p-4 text-gray-600 text-sm">
                    <div className="space-y-2">
                      <div>
                        <span className="block text-xs font-bold text-gray-500">
                          Email
                        </span>
                        {u.email ? (
                          <a
                            href={`mailto:${u.email}`}
                            className="break-all text-mmsu-green hover:underline"
                          >
                            {u.email}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-500">
                          Phone number
                        </span>
                        {u.contactNum?.trim() ? (
                          <a
                            href={`tel:${u.contactNum.replace(/[^+0-9]/g, "")}`}
                            className="inline-flex min-h-11 items-center break-all font-semibold text-mmsu-green hover:underline"
                          >
                            {u.contactNum}
                          </a>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </div>
                      {(u.studId || u.employeeId) && (
                        <div>
                          <span className="block text-xs font-bold text-gray-500">
                            {u.userType === "student"
                              ? "Student ID"
                              : "Employee ID"}
                          </span>
                          <span className="break-all">
                            {u.userType === "student" ? u.studId : u.employeeId}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="block md:table-cell p-4">
                    <span className="block md:hidden text-xs font-bold text-gray-500 mb-1">
                      Role
                    </span>
                    <select
                      aria-label={`Role for ${u.fullName}`}
                      value={u.userType}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="p-2 border border-gray-300 rounded outline-none cursor-pointer bg-white"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="staff">Staff</option>
                      <option value="visitor">Visitor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 flex flex-wrap items-center justify-start md:justify-center gap-2">
                    <button
                      onClick={() =>
                        toggleUserStatus(u.id, u.status || "active")
                      }
                      className={`px-3 py-1 rounded text-sm font-bold w-20 text-center ${
                        u.status === "disabled"
                          ? "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                          : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                      }`}
                    >
                      {u.status === "disabled" ? "Disabled" : "Active"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.fullName)}
                      className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded text-sm font-bold hover:bg-red-100 transition"
                    >
                      Delete
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
