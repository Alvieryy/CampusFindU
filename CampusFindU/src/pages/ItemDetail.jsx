import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SmartMatch from "../components/SmartMatch";
import Swal from "sweetalert2";

export default function ItemDetail({ type }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const endpoint =
          type === "lost" ? `/api/lost-items/${id}` : `/api/found-items/${id}`;
        const response = await axios.get(
          `https://campusfindu-backend.onrender.com${endpoint}`,
        );
        setItem(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [id, type]);

  if (loading) {
    return (
      <div className="p-5 text-center text-gray-500">Loading details...</div>
    );
  }
  if (!item) {
    return <div className="p-5 text-center text-gray-500">Item not found!</div>;
  }

  return (
    <div className="p-5 max-w-4xl mx-auto mt-10 font-sans">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:text-blue-800 text-sm mb-6 font-medium transition-colors"
      >
        &larr; Back to Reports
      </button>

      <div className="border border-gray-200 rounded-xl p-10 bg-white shadow-sm">
        <h2 className="mt-0 mb-10 text-2xl font-bold text-gray-800">
          Report Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-5">
            <DetailRow label="Report ID" value={item.id} />
            <DetailRow label="Item Name" value={item.title} />
            <DetailRow label="Category" value={item.category} />
            <DetailRow
              label="Date Reported"
              value={new Date(item.created_at).toLocaleDateString()}
            />
            <DetailRow label="Location" value={item.location_name} />

            <div className="flex flex-col sm:grid sm:grid-cols-[130px_1fr] items-start gap-1 sm:gap-0">
              <span className="text-gray-500 font-medium">Image</span>
              <div className="w-full">
                {item.image_url ? (
                  <>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="hidden sm:block max-w-[150px] rounded-md border border-gray-200 shadow-sm"
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
                      className="sm:hidden w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-mmsu-green font-bold rounded-lg border border-gray-200 transition shadow-sm"
                    >
                      View Image
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 italic text-sm">
                    No image provided
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[130px_1fr] items-center">
              <span className="text-gray-500 font-medium">Status</span>
              <div>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                    item.status === "lost"
                      ? "bg-orange-50 text-orange-600 border-orange-200"
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <DetailRow
              label="Type"
              value={type === "lost" ? "Lost Item" : "Found Item"}
            />

            <div className="flex flex-col sm:grid sm:grid-cols-[130px_1fr] items-start gap-1 sm:gap-0">
              <span className="text-gray-500 font-medium">Description</span>
              <span className="text-gray-800 leading-relaxed">
                {item.description}
              </span>
            </div>
          </div>

          {type === "found" && item.status !== "claimed" && (
            <button
              onClick={() => navigate(`/claim/${item.id}`)}
              className="mt-8 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md md:col-span-2"
            >
              Claim This Item ✋
            </button>
          )}
        </div>
      </div>

      <SmartMatch currentItem={item} type={type} />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[130px_1fr] items-start gap-1 sm:gap-0">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-gray-800 break-words">{value}</span>
    </div>
  );
}
