import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import axios from "axios";

export default function SidebarLayout({ children }) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const fetchUserProfile = async (uid) => {
    const { data, error } = await supabase
      .from("Users")
      .select("fullName, userType, avatarUrl")
      .eq("id", uid)
      .maybeSingle();

    if (data) setProfile(data);
  };

  const getInitials = (name) => {
    if (!name || name === "Loading...") return "";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const menuItems =
    profile.userType === "admin"
      ? [
          { name: "Dashboard", path: "/dashboard", icon: "" },
          { name: "Users", path: "/admin/users", icon: "" },
          { name: "Lost Items", path: "/lost-items", icon: "" },
          { name: "Found Items", path: "/found-items", icon: "" },
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
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* CHANGED: bg-[#0a192f] is now bg-mmsu-green */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-mmsu-green text-white flex flex-col shadow-xl z-[9999] transform transition-transform duration-300 md:relative md:z-0 md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 font-bold text-xl tracking-wider border-b border-mmsu-light-green">
          CampusFindU
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                // CHANGED: The active and hover states now use MMSU Gold and MMSU Light Green!
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive
                    ? "bg-mmsu-gold text-mmsu-green font-bold shadow-md"
                    : "text-gray-200 hover:bg-mmsu-light-green hover:text-white font-medium"
                }`}
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
          className="p-4 text-left text-gray-400 hover:text-white flex gap-3 items-center border-t border-mmsu-light-green font-medium"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* CHANGED: bg-[#0a192f] is now bg-mmsu-green */}
        <header className="bg-mmsu-green text-white p-4 px-4 md:px-8 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-white text-2xl mr-4"
            >
              ☰
            </button>
            <h2 className="font-medium text-base md:text-lg tracking-wide hidden sm:block">
              Campus Lost and Found System
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-mmsu-gold"
              />
            ) : (
              <div className="bg-mmsu-gold text-mmsu-green rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-sm tracking-widest border-2 border-mmsu-gold">
                {getInitials(profile.fullName)}
              </div>
            )}
            <div className="text-sm hidden sm:block">
              <p className="font-bold text-white">{profile.fullName}</p>
              <p className="text-gray-300 text-xs capitalize">
                {profile.userType}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
