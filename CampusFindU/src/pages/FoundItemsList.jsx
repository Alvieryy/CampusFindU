import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { MapPin, Tag } from "lucide-react";

export default function FoundItemsList() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(
          "https://campusfindu-backend.onrender.com/api/found-items",
        );
        setItems(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  });

  if (loading) return <div style={{ padding: "20px" }}>Loading items...</div>;

  return (
    <div className="max-w-7xl mx-auto font-sans bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-green-600">Found Items Board</h2>
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-12">
            No found items matched your search.
          </p>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col bg-white"
            >
              {item.image_url ? (
                <>
                  <img
                    src={item.image_url}
                    alt={item.title}
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
                    className="md:hidden w-full h-12 bg-green-50 hover:bg-green-100 text-green-700 font-bold flex items-center justify-center transition border-b border-green-100"
                  >
                    View Image
                  </button>
                </>
              ) : (
                <>
                  <div className="hidden md:flex w-full h-48 bg-green-50 items-center justify-center text-green-600/50 font-medium text-sm">
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
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.status === "claimed" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}
                  >
                    {item.status || "found"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-auto text-xs text-gray-500 flex flex-col gap-1.5 font-medium mb-4">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{item.location_name}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{item.category}</span>
                  </p>
                </div>

                <Link
                  to={`/items/found/${item.id}`}
                  className="w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-md transition text-sm shadow-sm"
                >
                  View Details & Claim
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
