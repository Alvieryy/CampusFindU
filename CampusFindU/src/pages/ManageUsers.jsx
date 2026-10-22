import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import Swal from "../utils/swal";

const collegeNames = {
  CCIS: "College of Computing and Information Sciences",
  COE: "College of Engineering",
  CAS: "College of Arts and Sciences",
  CAFSD: "College of Agriculture Food and Sustainable Development",
  CASAT: "College of Aquatic Science and Applied Technology",
  CBEA: "College of Business, Economics and Accountancy",
  CHS: "College of Health Sciences",
  CIT: "College of Industrial Technology",
  CTE: "College of Teacher Education",
  COM: "College of Medicine",
  COL: "College of Law",
  COD: "College of Dentistry",
  CVM: "College of Veterinary Medicine",
  GS: "College of Graduate School",
};

function getCollegeName(code) {
  return collegeNames[code] || code || "Not assigned";
}

function getRoleName(user) {
  if (user.userType === "admin") {
    return user.is_super_admin ? "Main Admin" : "College SC Admin";
  }

  const roles = {
    student: "Student",
    faculty: "Faculty",
    staff: "Staff",
    visitor: "Visitor",
  };

  return roles[user.userType] || user.userType;
}

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  const actionLock = useRef(false);

  const isMainAdmin = currentAdmin?.is_super_admin === true;

  const fetchUsers = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in again.");

      const { data: profile, error: profileError } = await supabase
        .from("Users")
        .select("id, userType, college, is_super_admin, status")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.userType !== "admin" || profile.status !== "active") {
        throw new Error("Only active administrators can access this page.");
      }

      if (!profile.is_super_admin && !profile.college) {
        throw new Error("Your admin account has no assigned college.");
      }

      let usersQuery = supabase
        .from("Users")
        .select(
          "id, fullName, email, contactNum, studId, employeeId, " +
            "userType, college, status, is_super_admin, is_online, createdAt",
        )
        .order("createdAt", { ascending: false });

      if (!profile.is_super_admin) {
        usersQuery = usersQuery
          .eq("userType", "student")
          .eq("college", profile.college);
      }

      const { data: userRows, error: usersError } = await usersQuery;

      if (usersError) throw usersError;

      let pendingRequests = [];

      if (profile.is_super_admin) {
        const { data, error } = await supabase
          .from("sc_admin_requests")
          .select("id, user_id, college, status, created_at")
          .eq("status", "pending")
          .order("created_at", { ascending: true });

        if (error) throw error;

        pendingRequests = data || [];
      }

      setCurrentAdmin(profile);
      setUsers(userRows || []);
      setRequests(pendingRequests);
    } catch (error) {
      setLoadError(error.message || "Unable to load users.");
      setCurrentAdmin(null);
      setUsers([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleReview = async (request, approve) => {
    if (!isMainAdmin || actionLock.current) return;

    actionLock.current = true;
    setBusy(true);

    try {
      const applicant = users.find((user) => user.id === request.user_id);
      const name = applicant?.fullName || "this applicant";

      const result = await Swal.fire({
        title: approve ? "Approve SC Admin?" : "Reject Application?",
        text: approve
          ? `${name} will become an SC admin for ${getCollegeName(
              request.college,
            )}.`
          : `${name}'s application will be rejected. Their account will remain a student.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: approve ? "Approve" : "Reject",
        confirmButtonColor: approve ? "#166534" : "#dc2626",
      });

      if (!result.isConfirmed) return;

      const { error } = await supabase.rpc("review_sc_admin_request", {
        request_id: request.id,
        approve,
      });

      if (error) throw error;

      await Swal.fire({
        title: approve ? "Approved!" : "Rejected",
        text: approve
          ? "The applicant is now a college SC admin."
          : "The application was rejected.",
        icon: "success",
      });

      await fetchUsers();
    } catch (error) {
      await Swal.fire(
        "Unable to Review",
        error.message || "Something went wrong.",
        "error",
      );
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };

  const toggleUserStatus = async (user) => {
    if (actionLock.current || !currentAdmin) return;

    const canManage =
      !user.is_super_admin &&
      user.id !== currentAdmin.id &&
      (isMainAdmin ||
        (user.userType === "student" && user.college === currentAdmin.college));

    if (!canManage) return;

    actionLock.current = true;
    setBusy(true);

    const newStatus = user.status === "active" ? "disabled" : "active";

    try {
      const result = await Swal.fire({
        title: newStatus === "disabled" ? "Disable User?" : "Activate User?",
        text: `Change ${user.fullName}'s account status to ${newStatus}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Confirm",
        confirmButtonColor: "#166534",
      });

      if (!result.isConfirmed) return;

      const { error } = await supabase
        .from("Users")
        .update({ status: newStatus })
        .eq("id", user.id)
        .select("id")
        .single();

      if (error) throw error;

      await fetchUsers();
    } catch (error) {
      await Swal.fire(
        "Unable to Update",
        error.message || "Something went wrong.",
        "error",
      );
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto font-sans bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>

          {currentAdmin && (
            <p className="mt-1 text-sm text-gray-500">
              {isMainAdmin
                ? "Manage users and review college SC admin applications."
                : `Manage students from ${getCollegeName(
                    currentAdmin.college,
                  )}.`}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading || busy}
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

      {loading ? (
        <p className="py-8 text-center text-gray-500">Loading...</p>
      ) : (
        currentAdmin && (
          <>
            {isMainAdmin && (
              <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  Pending SC Admin Applications ({requests.length})
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  Applicants remain students until you approve them.
                </p>

                {requests.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-500">
                    No pending applications.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {requests.map((request) => {
                      const applicant = users.find(
                        (user) => user.id === request.user_id,
                      );

                      return (
                        <div
                          key={request.id}
                          className="flex flex-col gap-4 rounded-lg border border-amber-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {applicant?.fullName || "Applicant"}
                            </p>

                            <p className="break-all text-sm text-gray-600">
                              {applicant?.email || "Email unavailable"}
                            </p>

                            <p className="mt-1 text-sm font-medium text-mmsu-green">
                              {getCollegeName(request.college)}
                            </p>

                            {applicant?.studId && (
                              <p className="mt-1 text-xs text-gray-500">
                                Student ID: {applicant.studId}
                              </p>
                            )}

                            <p className="mt-1 text-xs text-gray-500">
                              Applied:{" "}
                              {new Date(request.created_at).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={busy || !applicant}
                              onClick={() => handleReview(request, true)}
                              className="min-h-11 rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-50"
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleReview(request, false)}
                              className="min-h-11 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50 text-sm text-gray-500">
                  <tr>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Contact Details / ID</th>
                    <th className="p-4 font-medium">College</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Status / Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const canManage =
                        !user.is_super_admin &&
                        user.id !== currentAdmin.id &&
                        (isMainAdmin ||
                          (user.userType === "student" &&
                            user.college === currentAdmin.college));

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="p-4 align-top">
                            <p className="font-semibold text-gray-800">
                              {user.fullName || "Unnamed user"}
                            </p>

                            <span
                              className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                                user.is_online
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {user.is_online ? "Online" : "Offline"}
                            </span>
                          </td>

                          <td className="p-4 align-top text-sm text-gray-600">
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs font-bold text-gray-500">
                                  Email
                                </p>
                                {user.email ? (
                                  <a
                                    href={`mailto:${user.email}`}
                                    className="break-all text-mmsu-green hover:underline"
                                  >
                                    {user.email}
                                  </a>
                                ) : (
                                  "Not provided"
                                )}
                              </div>

                              <div>
                                <p className="text-xs font-bold text-gray-500">
                                  Phone number
                                </p>
                                {user.contactNum?.trim() ? (
                                  <a
                                    href={`tel:${user.contactNum.replace(
                                      /[^+0-9]/g,
                                      "",
                                    )}`}
                                    className="text-mmsu-green hover:underline"
                                  >
                                    {user.contactNum}
                                  </a>
                                ) : (
                                  "Not provided"
                                )}
                              </div>

                              {user.studId && (
                                <div>
                                  <p className="text-xs font-bold text-gray-500">
                                    Student ID
                                  </p>
                                  <p>{user.studId}</p>
                                </div>
                              )}

                              {user.employeeId && (
                                <div>
                                  <p className="text-xs font-bold text-gray-500">
                                    Employee ID
                                  </p>
                                  <p>{user.employeeId}</p>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="p-4 align-top text-sm text-gray-600">
                            {getCollegeName(user.college)}
                          </td>

                          <td className="p-4 align-top">
                            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                              {getRoleName(user)}
                            </span>
                          </td>

                          <td className="p-4 align-top">
                            <p
                              className={`text-sm font-semibold ${
                                user.status === "active"
                                  ? "text-green-700"
                                  : "text-gray-500"
                              }`}
                            >
                              {user.status === "active"
                                ? "Active"
                                : user.status === "disabled"
                                ? "Disabled"
                                : "Unknown"}
                            </p>

                            {canManage && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => toggleUserStatus(user)}
                                className="mt-2 min-h-11 rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                              >
                                {user.status === "active"
                                  ? "Disable"
                                  : "Activate"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </div>
  );
}
