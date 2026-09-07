import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Step 4: Fetch all claims so Admin can review them
  const fetchClaims = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/claims");
      setClaims(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // Step 5: Admin chooses Approve or Reject
  const handleDecision = async (claim, decision) => {
    try {
      // 1. Update the claim status (to 'approved' or 'rejected')
      await axios.put(`http://localhost:5000/api/claims/${claim.id}`, {
        status: decision,
      });

      // 2. If approved, lock the Found Item so nobody else can claim it
      if (decision === "approved") {
        await axios.put(
          `http://localhost:5000/api/found-items/${claim.found_item_id}`,
          { status: "claimed" },
        );
      }

      // 3. 🚨 SEND THE NOTIFICATION TO THE USER! 🚨
      const notifTitle =
        decision === "approved" ? "Claim Approved! 🎉" : "Claim Rejected ❌";
      const notifMessage =
        decision === "approved"
          ? "Good news! Your proof was accepted. Please proceed to the office to pick up your item."
          : "Unfortunately, your proof was not accepted for this item.";

      await axios.post("http://localhost:5000/api/notifications", {
        user_id: claim.claimant_id, // Send it directly to the person who claimed it
        title: notifTitle,
        message: notifMessage,
        type: "claim_update",
      });

      alert(`Claim ${decision} successfully, and the user was notified!`);
      fetchClaims(); // Refresh the list
    } catch (error) {
      console.error(error);
      alert("Error updating claim. Check console.");
    }
  };

  if (loading)
    return (
      <div className="p-5 text-gray-500 text-center">Loading claims...</div>
    );

  return (
    <div className="p-5 max-w-4xl mx-auto mt-10 font-sans">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        Admin Dashboard: Claims
      </h2>

      <div className="flex flex-col gap-5">
        {claims.length === 0 ? (
          <p className="text-gray-500">No claims exist yet.</p>
        ) : (
          claims.map((claim) => (
            <div
              key={claim.id}
              className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
            >
              <div className="flex-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    claim.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : claim.status === "approved"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {claim.status}
                </span>

                <p className="mt-4 text-gray-700">
                  <strong>Found Item ID:</strong>{" "}
                  <span className="text-xs text-gray-500">
                    {claim.found_item_id}
                  </span>
                </p>
                <p className="mt-2 text-gray-800">
                  <strong>Proof Provided:</strong> "{claim.proof_description}"
                </p>

                {claim.proof_image_url && (
                  <a
                    href={claim.proof_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm mt-3 inline-block underline font-medium"
                  >
                    View Proof Photo
                  </a>
                )}
              </div>

              {/* Show Action Buttons ONLY if the claim is still pending */}
              {claim.status === "pending" && (
                <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <button
                    onClick={() => handleDecision(claim, "approved")}
                    className="flex-1 md:flex-none bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition shadow-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(claim, "rejected")}
                    className="flex-1 md:flex-none bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition shadow-sm"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
