import { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import { useParams, Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { DetailSkeleton } from "../components/Skeleton";

export default function TrackStatus() {
  const { type, id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const endpoint =
          type === "lost" ? `/api/lost-items/${id}` : `/api/found-items/${id}`;
        const data = await apiClient.get(
          `https://campusfindu-backend.onrender.com${endpoint}`,
        );
        setItem(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, type]);

  if (loading) {
    return <DetailSkeleton />;
  }
  if (!item) {
    return (
      <div className="max-w-4xl mx-auto font-sans mt-4">
        <EmptyState
          title="Status Not Available"
          description="The item status you are attempting to track was not found."
          actionText="Back to My Items"
          actionLink="/my-items"
        />
      </div>
    );
  }

  const s = item.status;
  const step2 = s !== "lost" && s !== "found";
  const step3 = s === "claimed" || s === "approved";

  return (
    <div className="max-w-4xl mx-auto font-sans mt-4">
      <Link
        to="/my-items"
        className="text-blue-600 font-bold hover:underline mb-6 inline-block"
      >
        &larr; Back to My Items / Claims
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-8">
          <div className="w-48 h-48 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt="Item"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                📷
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{item.title}</h2>
              <StatusBadge status={item.status} />
            </div>

            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-gray-500 font-medium">Type:</div>
              <div className="font-semibold text-gray-800 capitalize">
                {type} Item
              </div>

              <div className="text-gray-500 font-medium">Category:</div>
              <div className="font-semibold text-gray-800">{item.category}</div>

              <div className="text-gray-500 font-medium">
                Date {type === "lost" ? "Lost" : "Found"}:
              </div>
              <div className="font-semibold text-gray-800">
                {new Date(item.created_at).toLocaleDateString()}
              </div>

              <div className="text-gray-500 font-medium">Location:</div>
              <div className="font-semibold text-gray-800">
                {item.location_name}
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 bg-gray-50">
          <h3 className="font-bold text-blue-900 text-lg mb-8">
            Status Timeline
          </h3>

          <div className="relative border-l-2 border-gray-200 ml-4 space-y-12">
            <div className="relative pl-10">
              <div className="absolute -left-[11px] top-1 w-5 h-5 bg-green-500 rounded-full border-4 border-gray-50 shadow-sm flex items-center justify-center">
                <span className="text-white text-[10px]">✓</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900">Reported</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    You reported this item to the system.
                  </p>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="relative pl-10">
              <div
                className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-gray-50 shadow-sm flex items-center justify-center transition-colors ${step2 ? "bg-blue-500" : "bg-gray-300"}`}
              >
                {step2 && <span className="text-white text-[10px]">✓</span>}
              </div>
              <div>
                <h4
                  className={`font-bold ${step2 ? "text-gray-900" : "text-gray-400"}`}
                >
                  Under Review / Pending Claim
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Waiting for ownership verification from Admin.
                </p>
              </div>
            </div>

            <div className="relative pl-10">
              <div
                className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-gray-50 shadow-sm flex items-center justify-center transition-colors ${step3 ? "bg-green-500" : "bg-gray-300"}`}
              >
                {step3 && <span className="text-white text-[10px]">✓</span>}
              </div>
              <div>
                <h4
                  className={`font-bold ${step3 ? "text-gray-900" : "text-gray-400"}`}
                >
                  Claimed / Released
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Item has been successfully released!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-blue-50 text-blue-800 p-4 rounded-lg flex items-center gap-3 text-sm font-medium border border-blue-100">
            You will be notified in the Notifications tab once your claim is
            verified.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "pending" || status === "lost") {
    return (
      <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 capitalize tracking-wide">
        {status}
      </span>
    );
  }
  if (status === "claimed" || status === "approved" || status === "found") {
    return (
      <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-200 capitalize tracking-wide">
        {status}
      </span>
    );
  }
  return (
    <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-200 capitalize tracking-wide">
      {status}
    </span>
  );
}
