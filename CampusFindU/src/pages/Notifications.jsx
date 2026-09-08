import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        fetchNotifications(session.user.id);
      }
    });
  }, []);

  const fetchNotifications = async (uid) => {
    try {
      const response = await axios.get(
        "https://campusfindu-backend.onrender.com/api/notifications",
      );
      // Only show notifications that belong to the logged-in user!
      const userNotifs = response.data.filter((n) => n.user_id === uid);
      setNotifications(userNotifs);
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`https://campusfindu-backend.onrender.com/api/notifications/${id}/read`);
      // Update the screen instantly
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-5 font-sans">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        Notifications 🔔
      </h2>

      <div className="flex flex-col gap-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">You have no notifications.</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-6 rounded-xl border transition-all ${
                notif.is_read
                  ? "bg-gray-50 border-gray-200"
                  : "bg-blue-50 border-blue-300 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    className={`text-lg ${notif.is_read ? "font-medium text-gray-700" : "font-bold text-blue-900"}`}
                  >
                    {notif.title}
                  </h3>
                  <p
                    className={`${notif.is_read ? "text-gray-500" : "text-blue-800"} mt-2`}
                  >
                    {notif.message}
                  </p>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-sm bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Mark as Read ✓
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
