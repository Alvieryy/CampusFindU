import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function MyItems() {
  const [activeTab, setActiveTab] = useState("lost");
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;
      setCurrentUserId(uid);

      try {
        const [lostRes, foundRes, claimsRes] = await Promise.all([
          axios.get("https://campusfindu-backend.onrender.com/api/lost-items"),
          axios.get("https://campusfindu-backend.onrender.com/api/found-items"),
          axios.get("https://campusfindu-backend.onrender.com/api/claims"),
        ]);

        setLostItems(lostRes.data || []);
        setFoundItems(foundRes.data || []);
        setMyClaims(
          (claimsRes.data || []).filter((claim) => claim.claimant_id === uid),
        );
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-gray-500 font-sans">Loading data...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-sans bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab("lost")}
          className={`px-8 py-4 font-bold text-sm transition ${activeTab === "lost" ? "text-blue-700 border-b-2 border-blue-700 bg-white" : "text-gray-500 hover:text-gray-700"}`}
        >
          Lost Items
        </button>
        <button
          onClick={() => setActiveTab("found")}
          className={`px-8 py-4 font-bold text-sm transition ${activeTab === "found" ? "text-blue-700 border-b-2 border-blue-700 bg-white" : "text-gray-500 hover:text-gray-700"}`}
        >
          Found Items
        </button>
        <button
          onClick={() => setActiveTab("claims")}
          className={`px-8 py-4 font-bold text-sm transition ${activeTab === "claims" ? "text-blue-700 border-b-2 border-blue-700 bg-white" : "text-gray-500 hover:text-gray-700"}`}
        >
          My Claims
        </button>
      </div>

      <div className="p-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-gray-500 text-sm border-b border-gray-200">
            <tr>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Item / Details</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === "lost" &&
              (lostItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-gray-500 text-center">
                    No lost items reported yet.
                  </td>
                </tr>
              ) : (
                lostItems.map((item) => (
                  <tr
                    key={`lost-${item.id}`}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 font-semibold text-gray-700">
                      Lost Item
                    </td>
                    <td className="py-4 text-gray-800">
                      <span className="font-medium">{item.title}</span>
                      {item.user_id === currentUserId && (
                        <span className="ml-2 text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4">
                      <Link
                        to={`/items/lost/${item.id}`}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ))}

            {activeTab === "found" &&
              (foundItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-gray-500 text-center">
                    No found items reported yet.
                  </td>
                </tr>
              ) : (
                foundItems.map((item) => (
                  <tr
                    key={`found-${item.id}`}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 font-semibold text-gray-700">
                      Found Item
                    </td>
                    <td className="py-4 text-gray-800">
                      <span className="font-medium">{item.title}</span>
                      {item.user_id === currentUserId && (
                        <span className="ml-2 text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4">
                      <Link
                        to={`/items/found/${item.id}`}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ))}

            {activeTab === "claims" &&
              (myClaims.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-gray-500 text-center">
                    You haven't submitted any claims.
                  </td>
                </tr>
              ) : (
                myClaims.map((claim) => (
                  <tr
                    key={`claim-${claim.id}`}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 font-semibold text-gray-700">
                      Claim Request
                    </td>
                    <td className="py-4 text-gray-800 text-sm truncate max-w-xs">
                      Proof: {claim.proof_description}
                    </td>
                    <td className="py-4 text-gray-500">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="py-4">
                      <Link
                        to={`/items/found/${claim.found_item_id}`}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        View Found Item
                      </Link>
                    </td>
                  </tr>
                ))
              ))}
          </tbody>
        </table>
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
