import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    contactNum: "",
    studId: "",
    employeeId: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("Users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setProfile(data);
        setFormData({
          fullName: data.fullName || "",
          contactNum: data.contactNum || "",
          studId: data.studId || "",
          employeeId: data.employeeId || "",
        });
      }
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSaving(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${profile.id}-${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("Profile")
      .upload(fileName, file);

    if (uploadError) {
      Swal.fire("Upload Failed", uploadError.message, "error");
      setSaving(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("Profile")
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from("Users")
      .update({ avatarUrl: publicUrl })
      .eq("id", profile.id);

    if (updateError) {
      Swal.fire("Error", updateError.message, "error");
    } else {
      setProfile({ ...profile, avatarUrl: publicUrl });
      Swal.fire({
        title: "Success",
        text: "Profile picture updated!",
        icon: "success",
        confirmButtonColor: "#0A4222",
      });
    }
    setSaving(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("Users")
      .update({
        fullName: formData.fullName,
        contactNum: formData.contactNum.trim(),
        studId: formData.studId,
        employeeId: formData.employeeId,
      })
      .eq("id", profile.id);

    if (error) {
      Swal.fire("Error", error.message, "error");
    } else {
      Swal.fire({
        title: "Profile Updated!",
        text: "Your information has been saved successfully.",
        icon: "success",
        confirmButtonColor: "#0A4222",
      });
      fetchProfile();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="text-center mt-10 font-bold text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-3xl font-black text-mmsu-green mb-8 border-b pb-4">
        My Profile
      </h2>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="flex flex-col items-center md:w-1/3">
          <div className="relative group w-32 h-32 mb-4 cursor-pointer">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-white outline outline-2 outline-mmsu-green shadow-md"
              />
            ) : (
              <div className="w-full h-full bg-mmsu-gold text-mmsu-green rounded-full flex items-center justify-center text-6xl font-black shadow-md border-4 border-white outline outline-2 outline-mmsu-green">
                {profile?.fullName?.charAt(0).toUpperCase()}
              </div>
            )}

            <label className="absolute inset-0 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer text-sm font-bold">
              {saving ? "Uploading..." : "Change Pic"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={saving}
              />
            </label>
          </div>

          <h3 className="text-xl font-bold text-gray-800 text-center">
            {profile?.fullName}
          </h3>
          <p className="text-mmsu-light-green text-sm capitalize font-bold mb-6">
            {profile?.userType}
          </p>

          <div className="bg-gray-50 p-4 rounded-xl w-full text-center border border-gray-200 shadow-inner">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
              Registered Email
            </p>
            <p className="text-sm font-bold text-gray-800 break-all">
              {profile?.email}
            </p>
          </div>
        </div>

        <div className="md:w-2/3">
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
                className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50"
              />
            </div>

            <div>
              <label
                htmlFor="contactNum"
                className="block text-sm font-bold text-gray-700 mb-1"
              >
                Contact Number
              </label>
              <input
                id="contactNum"
                type="tel"
                autoComplete="tel"
                placeholder="e.g. 09123456789"
                aria-describedby="contact-number-help"
                required={profile?.userType === "visitor"}
                value={formData.contactNum}
                onChange={(e) =>
                  setFormData({ ...formData, contactNum: e.target.value })
                }
                className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50"
              />
              <p
                id="contact-number-help"
                className="mt-2 text-sm text-gray-500"
              >
                {profile?.userType === "visitor"
                  ? "Required for visitors. "
                  : "Optional. "}
                Add a phone number so campus administrators can contact you
                about your reports and claims.
              </p>
            </div>

            {profile?.userType === "student" && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={formData.studId}
                  onChange={(e) =>
                    setFormData({ ...formData, studId: e.target.value })
                  }
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50"
                />
              </div>
            )}

            {(profile?.userType === "faculty" ||
              profile?.userType === "staff" ||
              profile?.userType === "admin") && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full bg-mmsu-green text-white font-bold text-lg py-4 rounded-lg hover:bg-mmsu-light-green transition shadow-md disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
