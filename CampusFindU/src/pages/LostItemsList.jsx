import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

export default function LostItemsList() {
  const [items, setItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Check if user is admin
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase
          .from("Users")
          .select("userType")
          .eq("id", session.user.id)
          .single();
        if (userData?.userType === "admin") setIsAdmin(true);
      }

      // 2. Fetch items
      const response = await axios.get(
        "https://campusfindu-backend.onrender.com/api/lost-items",
      );
      // Sort newest first
      setItems(
        response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete this report from the database!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `https://campusfindu-backend.onrender.com/api/lost-items/${id}`,
        );
        Swal.fire("Deleted!", "The report has been removed.", "success");
        fetchData(); // refresh list
      } catch (err) {
        Swal.fire("Error", "Failed to delete report. Check backend.", "error");
      }
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.put(
        `https://campusfindu-backend.onrender.com/api/lost-items/${id}`,
        { status: "resolved" },
      );
      Swal.fire("Resolved!", "Item marked as resolved.", "success");
      fetchData(); // refresh list
    } catch (err) {
      Swal.fire("Error", "Failed to update status.", "error");
    }
  };

  if (loading)
    return (
      <div className="p-8 font-bold text-gray-500">Loading Lost Items...</div>
    );

  return (
    <div className="max-w-7xl mx-auto font-sans bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-red-600">Lost Items Board</h2>
        {isAdmin && (
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
            Admin Mode Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col bg-white"
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-50 flex items-center justify-center text-gray-400 font-medium">
                No Image Provided
              </div>
            )}

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900 truncate pr-2">
                  {item.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.status === "resolved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {item.status || "lost"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {item.description}
              </p>

              <div className="mt-auto text-xs text-gray-500 flex flex-col gap-1.5 font-medium">
                <p className="flex items-center gap-1">{item.location_name}</p>
                <p className="flex items-center gap-1">🏷️ {item.category}</p>
              </div>

              {/* ADMIN CONTROLS */}
              {isAdmin && (
                <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => handleResolve(item.id)}
                    disabled={item.status === "resolved"}
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-bold py-2 rounded transition disabled:opacity-50"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold py-2 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-12">
            No lost items reported yet.
          </p>
        )}
      </div>
    </div>
  );
}
