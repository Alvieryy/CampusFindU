import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/apiClient";
import Swal from "../utils/swal";
import Toast from "../utils/toast";
import { MapPin, Tag } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { CardGridSkeleton } from "../components/Skeleton";

export default function LostItemsList() {
  const { profile } = useAuth();
  const isAdmin = profile?.userType === "admin";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (force = false) => {
    try {
      const data = await apiClient.get(
        "https://campusfindu-backend.onrender.com/api/lost-items",
        { force },
      );
      setItems(
        (data || []).sort(
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
        await apiClient.delete(
          `https://campusfindu-backend.onrender.com/api/lost-items/${id}`,
        );
        Toast.fire("Deleted!", "The report has been removed.", "success");
        fetchData(true);
      } catch {
        Toast.fire("Error", "Failed to delete report. Check backend.", "error");
      }
    }
  };

  const handleResolve = async (id) => {
    try {
      await apiClient.put(
        `https://campusfindu-backend.onrender.com/api/lost-items/${id}`,
        { status: "resolved" },
      );
      Toast.fire("Resolved!", "Item marked as resolved.", "success");
      fetchData(true);
    } catch {
      Toast.fire("Error", "Failed to update status.", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto font-sans bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-8">
        <div className="flex justify-between items-center mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48" />
        </div>
        <CardGridSkeleton count={8} />
      </div>
    );
  }

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
        {items.length === 0 ? (
          <div className="col-span-full py-4">
            <EmptyState
              title="No Lost Items Reported"
              description="Great news! There are currently no missing items reported on campus. If you've lost an item, submit a report so the community can help you find it."
              actionText="Report a Lost Item"
              actionLink="/report-lost"
            />
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col bg-white"
            >
              {item.image_url ? (
                <>
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="hidden md:block w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: item.title,
                        imageUrl: item.image_url,
                        imageAlt: item.title,
                        width: "90%",
                        imageWidth: "100%",
                        confirmButtonColor: "#0A4222",
                      });
                    }}
                    className="md:hidden w-full h-12 bg-gray-100 hover:bg-gray-200 text-mmsu-green font-bold flex items-center justify-center transition border-b border-gray-200"
                  >
                    View Image
                  </button>
                </>
              ) : (
                <>
                  <div className="hidden md:flex w-full h-48 bg-gray-50 items-center justify-center text-gray-400 font-medium">
                    No Image Provided
                  </div>
                  <div className="md:hidden w-full h-12 bg-gray-50 flex items-center justify-center text-gray-400 font-medium text-sm border-b border-gray-200">
                    No Image Provided
                  </div>
                </>
              )}

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 truncate pr-2">
                    {item.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status || "lost"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-auto text-xs text-gray-500 flex flex-col gap-1.5 font-medium">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{item.location_name}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{item.category}</span>
                  </p>
                </div>

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
          ))
        )}

        {items.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-12">
            No lost items reported yet.
          </p>
        )}
      </div>
    </div>
  );
}
