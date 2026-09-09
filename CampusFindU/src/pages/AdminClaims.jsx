import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      const response = await axios.get(
        "https://campusfindu-backend.onrender.com/api/claims",
      );
      // Sort so pending claims show at the top!
      const sorted = response.data.sort((a, b) =>
        a.status === "pending" ? -1 : 1,
      );
      setClaims(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleDecision = async (claim, decision) => {
    try {
      // 1. Update the claim status to approved or rejected
      await axios.put(
        `https://campusfindu-backend.onrender.com/api/claims/${claim.id}`,
        {
          status: decision,
        },
      );

      // 2. If approved, we need to mark the actual Found Item as "claimed"
      if (decision === "approved") {
        await axios.put(
          `https://campusfindu-backend.onrender.com/api/found-items/${claim.found_item_id}`,
          {
            status: "claimed",
          },
        );
      }

      // 3. Send a notification to the user
      await axios.post(
        "https://campusfindu-backend.onrender.com/api/notifications",
        {
          user_id: claim.user_id,
          message: `Your claim for item #${claim.found_item_id} has been ${decision}.`,
          type: decision === "approved" ? "success" : "error",
        },
      );

      Swal.fire(
        decision === "approved" ? "Approved!" : "Rejected!",
        `The claim has been ${decision} and the user has been notified.`,
        decision === "approved" ? "success" : "info",
      );

      fetchClaims(); // Refresh the list
    } catch (error) {
      Swal.fire("Error", "Something went wrong processing the claim.", "error");
    }
  };

  if (loading)
    return <div className="p-8 font-bold text-gray-500">Loading Claims...</div>;

  return (
    <div className="max-w-6xl mx-auto font-sans bg-white border border-gray-200 rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Review Pending Claims
      </h2>

      {claims.length === 0 ? (
        <p className="text-gray-500">No claims have been submitted yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-blue-900">
                    Claim for Item #{claim.found_item_id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Submitted by User: {claim.user_id}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    claim.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : claim.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {claim.status}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-100">
                <p className="text-sm font-bold text-gray-700 mb-1">
                  Evidence Provided:
                </p>
                <p className="text-sm text-gray-600 italic whitespace-pre-wrap">
                  "{claim.proof_description}"
                </p>
              </div>

              {claim.status === "pending" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleDecision(claim, "approved")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
                  >
                    Approve Claim
                  </button>
                  <button
                    onClick={() => handleDecision(claim, "rejected")}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 rounded transition"
                  >
                    Reject Claim
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
