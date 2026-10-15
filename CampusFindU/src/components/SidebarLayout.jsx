import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import axios from "axios";

export default function SidebarLayout({ children }) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const mobile = window.matchMedia("(max-width: 767px)");
    if (!mobile.matches) {
      setIsMobileMenuOpen(false);
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
      if (event.key !== "Tab") return;
      const controls = Array.from(
        sidebarRef.current?.querySelectorAll(
          "a[href], button:not([disabled])",
        ) || [],
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const handleResize = () => {
      if (!mobile.matches) setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    mobile.addEventListener("change", handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      mobile.removeEventListener("change", handleResize);
      if (mobile.matches) menuButtonRef.current?.focus();
    };
  }, [isMobileMenuOpen]);

  const [profile, setProfile] = useState({
    fullName: "Loading...",
    userType: "...",
  });

  useEffect(() => {
    let currentUserId = null;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        currentUserId = session.user.id;
        fetchUnreadCount(session.user.id);
        fetchUserProfile(session.user.id);
        supabase
          .from("Users")
          .update({ is_online: true })
          .eq("id", session.user.id)
          .then();
      }
    });

    const handleUnload = () => {
      if (currentUserId) {
        // Best effort to set offline when closing tab
        supabase
          .from("Users")
          .update({ is_online: false })
          .eq("id", currentUserId)
          .then();
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // Idle Auto-Logout Security Feature (15 Minutes)
  useEffect(() => {
    let idleTimer;

    const handleAutoLogout = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from("Users")
          .update({ is_online: false })
          .eq("id", session.user.id);
        await supabase.auth.signOut();
        window.location.href = "/login?timeout=true";
      }
    };

    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(handleAutoLogout, 15 * 60 * 1000); // 15 minutes in milliseconds
    };

    // Reset timer on any user interaction
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    // Start timer immediately
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
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
    <div className="flex h-dvh bg-gray-50 font-sans">
      {isMobileMenuOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/40 z-[9998] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* CHANGED: bg-[#0a192f] is now bg-mmsu-green */}
      <aside
        id="main-sidebar"
        ref={sidebarRef}
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 w-[240px] max-w-[82vw] md:w-64 md:max-w-none shrink-0 bg-mmsu-green text-white flex flex-col shadow-xl z-[9999] transform transition-transform duration-200 motion-reduce:transition-none md:visible md:relative md:z-0 md:translate-x-0 ${
          isMobileMenuOpen
            ? "translate-x-0 visible"
            : "-translate-x-full invisible"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-mmsu-light-green px-4 py-4 md:px-6">
          <span className="text-lg font-bold tracking-wide">CampusFindU</span>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white md:hidden"
          >
            {/* Lucide X icon, inline SVG: no additional dependency. */}
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 md:p-4 flex flex-col gap-1 md:gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                // CHANGED: The active and hover states now use MMSU Gold and MMSU Light Green!
                className={`flex min-h-11 items-center gap-3 p-3 text-sm md:text-base rounded-lg transition ${
                  isActive
                    ? "bg-mmsu-gold text-mmsu-green font-bold shadow-md"
                    : "text-gray-200 hover:bg-mmsu-light-green hover:text-white font-medium"
                }`}
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
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
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session) {
              await supabase
                .from("Users")
                .update({ is_online: false })
                .eq("id", session.user.id);
            }
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="shrink-0 p-4 text-left text-gray-400 hover:text-white flex gap-3 items-center border-t border-mmsu-light-green font-medium"
        >
          Logout
        </button>
      </aside>

      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        {/* CHANGED: bg-[#0a192f] is now bg-mmsu-green */}
        <header className="bg-mmsu-green text-white p-4 px-4 md:px-8 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Open navigation"
              aria-expanded={isMobileMenuOpen}
              aria-controls="main-sidebar"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-white mr-3 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg
                aria-hidden="true"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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

        <main className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
          <div className="flex-1 p-4 md:p-8">{children}</div>

          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex justify-center md:justify-start mb-4 md:mb-0">
                  <p className="text-center md:text-left text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} CampusFindU. All rights
                    reserved.
                    <br />
                    <span className="block mt-1">
                      Location: Batac City, Ilocos Norte
                    </span>
                  </p>
                </div>
                <div className="flex justify-center md:justify-end gap-6 text-sm">
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=libedmonalvier@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-mmsu-green transition-colors font-medium"
                  >
                    Contact Developer
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
