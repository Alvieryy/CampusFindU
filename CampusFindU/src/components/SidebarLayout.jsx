import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import axios from "axios";

export default function SidebarLayout({ children }) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState({
    fullName: "Loading...",
    userType: "...",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUnreadCount(session.user.id);
        fetchUserProfile(session.user.id);
      }
    });
  }, []);

  const fetchUnreadCount = async (uid) => {
    try {
      const response = await axios.get(
        "https://campusfindu-backend.onrender.com/api/notifications",
      );
      const unread = response.data.filter(
        (n) => n.user_id === uid && n.is_read === false,
      );
      setUnreadCount(unread.length);
    } catch (error) {}
  };

  // Fetch the actual user from the database
  const fetchUserProfile = async (uid) => {
    const { data, error } = await supabase
      .from("Users")
      .select("fullName, userType")
      .eq("id", uid)
      .maybeSingle();

    if (data) setProfile(data);
  };

  // Helper function to extract initials (e.g. "Juan Dela Cruz" -> "JC")
  const getInitials = (name) => {
    if (!name || name === "Loading...") return "";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // If the user is an admin, show the Admin menu. Otherwise, show the Student menu!
  const menuItems =
    profile.userType === "admin"
      ? [
          { name: "Dashboard", path: "/dashboard", icon: "" },
          { name: "Users", path: "/admin/users", icon: "" },
          { name: "Review Claims", path: "/admin/claims", icon: "" },
          { name: "Reports", path: "/admin/reports", icon: "" },
          { name: "System Settings", path: "/admin/settings", icon: "" },
          { name: "Campus Map", path: "/campus-map", icon: "" },
          { name: "Notifications", path: "/notifications", icon: "" },
          { name: "Profile", path: "/profile", icon: "" },
        ]
      : [
          { name: "Dashboard", path: "/dashboard", icon: "" },
          { name: "Report Lost Item", path: "/report-lost", icon: "" },
          { name: "Report Found Item", path: "/report-found", icon: "" },
          { name: "My Items / Claims", path: "/my-items", icon: "" },
          { name: "Campus Map", path: "/campus-map", icon: "" },
          { name: "Notifications", path: "/notifications", icon: "" },
          { name: "Profile", path: "/profile", icon: "" },
        ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0a192f] text-white flex flex-col shadow-xl z-20">
        <div className="p-6 font-bold text-xl tracking-wider border-b border-gray-800">
          CampusFindU
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${isActive ? "bg-blue-600 text-white font-bold" : "text-gray-300 hover:bg-gray-800 hover:text-white font-medium"}`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
                {item.name === "Notifications" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="p-4 text-left text-gray-400 hover:text-white flex gap-3 items-center border-t border-gray-800 font-medium"
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR */}
        <header className="bg-[#0a192f] text-white p-4 px-8 flex justify-between items-center shadow-md z-10">
          <h2 className="font-medium text-lg tracking-wide">
            Campus Lost and Found System
          </h2>
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-sm tracking-widest">
              {getInitials(profile.fullName)}
            </div>
            <div className="text-sm">
              <p className="font-bold">{profile.fullName}</p>
              <p className="text-gray-300 text-xs capitalize">
                {profile.userType}
              </p>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
