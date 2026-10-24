import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Toast from "../utils/toast";

export default function SubmitClaim() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    proof_description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId)
      return Toast.fire(
        "Sign in required",
        "Please log in to claim an item.",
        "warning",
      );

    setIsSubmitting(true);

    try {
      let finalImageUrl = "";

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("Items")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("Items").getPublicUrl(filePath);
        finalImageUrl = data.publicUrl;
      }

      await axios.post("https://campusfindu-backend.onrender.com/api/claims", {
        found_item_id: id,
        claimant_id: userId,
        proof_description: formData.proof_description,
        proof_image_url: finalImageUrl,
      });

      Toast.fire({
        title: "Success!",
        text: "Claim submitted.",
        icon: "success",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      Toast.fire("Unable to submit claim", "Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 max-w-lg mx-auto mt-10 font-sans">
      <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Claim Item</h2>
        <p className="text-gray-500 mb-8">
          Please provide proof that this item belongs to you.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Proof Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="e.g. My ID is inside, or my lock screen is a picture of my dog..."
              required
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition shadow-sm"
              onChange={(e) =>
                setFormData({ ...formData, proof_description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Proof Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white transition shadow-sm"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Uploading..." : "Submit Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
