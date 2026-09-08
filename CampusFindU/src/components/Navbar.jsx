import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { supabase } from "../supabaseClient";

export default function Navbar() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async (uid) => {
    try {
      const response = await axios.get(
        "https://campusfindu-backend.onrender.com/api/notifications",
      );
      // Count how many notifications belong to this user AND are unread
      const unread = response.data.filter(
        (n) => n.user_id === uid && n.is_read === false,
      );
      setUnreadCount(unread.length);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Check immediately when page loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchUnreadCount(session.user.id);
    });

    // Check again every 10 seconds in the background
    const interval = setInterval(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) fetchUnreadCount(session.user.id);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-blue-900 text-white p-4 shadow-md font-sans">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold tracking-wider">
          CampusFindU
        </Link>

        <div className="flex gap-8 items-center font-medium">
          <Link to="/lost-items" className="hover:text-blue-200 transition">
            Lost Items
          </Link>
          <Link to="found-items" className="hover:text-blue-200 transition">
            Found Items
          </Link>
          <Link to="/campus-map" className="hover:text-blue-200 transition">
            Map
          </Link>

          {/* THE NOTIFICATION BELL WITH BADGE */}
          <Link
            to="/notifications"
            className="relative hover:opacity-80 transition text-xl"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                {unreadCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-1.5 rounded text-sm transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
