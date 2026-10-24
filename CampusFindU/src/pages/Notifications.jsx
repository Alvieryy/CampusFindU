import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";
import EmptyState from "../components/EmptyState";
import { ListSkeleton } from "../components/Skeleton";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchNotifications(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchNotifications = async (uid) => {
    try {
      const response = await axios.get(
        "https://campusfindu-backend.onrender.com/api/notifications",
      );
      const userNotifs = response.data.filter((n) => n.user_id === uid);
      setNotifications(userNotifs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `https://campusfindu-backend.onrender.com/api/notifications/${id}/read`,
      );
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 sm:mt-10 p-4 sm:p-5 font-sans">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Notifications</h2>

      {loading ? (
        <ListSkeleton count={4} />
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.length === 0 ? (
            <EmptyState
              icon={
                <svg
                  className="w-8 h-8 text-mmsu-green opacity-80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              }
              title="No Notifications Yet"
              description="You're all caught up! Updates regarding your reported items, claims, and status changes will appear here."
              actionText="Go to Dashboard"
              actionLink="/dashboard"
            />
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
                      className={`text-lg ${
                        notif.is_read
                          ? "font-medium text-gray-700"
                          : "font-bold text-blue-900"
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <p
                      className={`${
                        notif.is_read ? "text-gray-500" : "text-blue-800"
                      } mt-2`}
                    >
                      {notif.message}
                    </p>
                  </div>

                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-sm bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition shrink-0 ml-4"
                    >
                      Mark as Read ✓
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
