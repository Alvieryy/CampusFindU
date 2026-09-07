import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import LocationPickerMap from "../components/LocationPickerMap";

export default function ReportFoundItem() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Electronics",
    location_name: "",
    latitude: 18.0583,
    longitude: 120.5446,
    status: "found",
  });

  // New state to hold the actual file and a loading spinner state
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return alert("You must be logged in!");

    setIsSubmitting(true); // Disable button so they don't click twice!

    try {
      let finalImageUrl = "";

      // IF THE USER SELECTED A PHOTO, UPLOAD IT TO SUPABASE FIRST!
      if (imageFile) {
        // Create a unique file name so images don't overwrite each other
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`; // Save it in a folder named after the user

        // 1. Upload to the 'item-images' bucket
        const { error: uploadError } = await supabase.storage
          .from("Items")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // 2. Get the public URL of the image we just uploaded
        const { data } = supabase.storage
          .from("item-images")
          .getPublicUrl(filePath);
        finalImageUrl = data.publicUrl;
      }

      // NOW SEND EVERYTHING (INCLUDING THE IMAGE URL) TO OUR EXPRESS BACKEND
      await axios.post("http://localhost:5000/api/found-items", {
        ...formData,
        user_id: userId,
        image_url: finalImageUrl,
      });

      alert("Found item reported successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error reporting item or uploading image. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto font-sans bg-white border border-gray-200 rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-blue-900 mb-2">
        Report Found Item
      </h2>
      <p className="text-gray-500 mb-8">
        Please provide details about the found item and pin its exact location.
      </p>

      <LocationPickerMap
        onLocationSelect={(lat, lng) => {
          setFormData({ ...formData, latitude: lat, longitude: lng });
        }}
      />

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter item name"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Enter description (color, brand, etc.)"
                required
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition shadow-sm"
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition shadow-sm"
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="Electronics">Electronics</option>
                <option value="Wallets">Wallets & IDs</option>
                <option value="Clothing">Clothing</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Location Found <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter location (e.g. Library 2nd Floor)"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
                onChange={(e) =>
                  setFormData({ ...formData, location_name: e.target.value })
                }
              />
            </div>

            {/* NEW FILE UPLOAD INPUT */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white transition shadow-sm"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
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
            {isSubmitting ? "Uploading..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
}
