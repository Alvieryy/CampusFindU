import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

const collegeNames = {
  CCIS: "College of Computing and Information Sciences",
  COE: "College of Engineering",
  CAS: "College of Arts and Sciences",
  CAFSD: "College of Agriculture Food and Sustainable Development",
  CASAT: "College of Aquatic Science and Applied Technology",
  CBEA: "College of Business, Economics and Accountancy",
  CHS: "College of Health Sciences",
  CIT: "College of Industrial Technology",
  CTE: "College of Teacher Education",
  COM: "College of Medicine",
  COL: "College of Law",
  COD: "College of Dentistry",
  CVM: "College of Veterinary Medicine",
  GS: "College of Graduate School",
};

const inputClass =
  "w-full p-4 border border-gray-300 rounded-lg outline-none " +
  "focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green " +
  "transition bg-gray-50/50";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    contactNum: "",
    studId: "",
    employeeId: "",
  });

  const applyProfile = (data) => {
    setProfile(data);
    setFormData({
      fullName: data.fullName || "",
      contactNum: data.contactNum || "",
      studId: data.studId || "",
      employeeId: data.employeeId || "",
    });
  };

  const fetchProfile = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in to view your profile.");

      const { data, error } = await supabase
        .from("Users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      applyProfile(data);
    } catch (error) {
      setLoadError(error.message || "Unable to load your profile.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const isCollegeAdmin =
    profile?.userType === "admin" && !profile?.is_super_admin;

  const showStudentId =
    profile?.userType === "student" ||
    isCollegeAdmin ||
    Boolean(profile?.studId);

  const showEmployeeId =
    profile?.userType === "faculty" ||
    profile?.userType === "staff" ||
    Boolean(profile?.employeeId);

  const busy = saving || uploading;

  const roleLabel =
    profile?.userType === "admin"
      ? profile.is_super_admin
        ? "Main Admin"
        : "College SC Admin"
      : {
          student: "Student",
          faculty: "Faculty",
          staff: "Staff",
          visitor: "Visitor",
        }[profile?.userType] || profile?.userType;

  const collegeLabel =
    collegeNames[profile?.college] || profile?.college || "Not assigned";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !profile || busy) return;

    const extensions = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };

    if (!extensions[file.type]) {
      await Swal.fire(
        "Invalid Image",
        "Please choose a JPG, PNG, or WebP image.",
        "warning",
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      await Swal.fire(
        "Image Too Large",
        "Please choose an image smaller than 5 MB.",
        "warning",
      );
      return;
    }

    setUploading(true);

    try {
      const fileName =
        `${profile.id}-${crypto.randomUUID()}.` + extensions[file.type];

      const { error: uploadError } = await supabase.storage
        .from("Profile")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("Profile").getPublicUrl(fileName);

      const { data, error: updateError } = await supabase
        .from("Users")
        .update({ avatarUrl: publicUrl })
        .eq("id", profile.id)
        .select("avatarUrl")
        .single();

      if (updateError) throw updateError;

      setProfile((previous) => ({
        ...previous,
        avatarUrl: data.avatarUrl,
      }));

      await Swal.fire({
        title: "Success",
        text: "Profile picture updated!",
        icon: "success",
        confirmButtonColor: "#0A4222",
      });
    } catch (error) {
      await Swal.fire(
        "Upload Failed",
        error.message || "Unable to update your profile picture.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!profile || busy) return;

    const fullName = formData.fullName.trim();
    const contactNum = formData.contactNum.trim();

    if (!fullName) {
      await Swal.fire("Required", "Please enter your full name.", "warning");
      return;
    }

    if (profile.userType === "visitor" && !contactNum) {
      await Swal.fire(
        "Required",
        "Please enter your contact number.",
        "warning",
      );
      return;
    }

    setSaving(true);

    try {
      const updates = {
        fullName,
        contactNum,
      };

      // Only submit ID fields displayed on this profile.
      // College and role are never changed by this form.
      if (showStudentId) {
        updates.studId = formData.studId.trim();
      }

      if (showEmployeeId) {
        updates.employeeId = formData.employeeId.trim();
      }

      const { data, error } = await supabase
        .from("Users")
        .update(updates)
        .eq("id", profile.id)
        .select("*")
        .single();

      if (error) throw error;

      applyProfile(data);

      await Swal.fire({
        title: "Profile Updated!",
        text: "Your information has been saved successfully.",
        icon: "success",
        confirmButtonColor: "#0A4222",
      });
    } catch (error) {
      await Swal.fire(
        "Error",
        error.message || "Unable to save your profile.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 font-bold text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto rounded-xl border border-red-200 bg-red-50 p-6">
        <p role="alert" className="text-red-700">
          {loadError || "Your profile could not be loaded."}
        </p>

        <button
          type="button"
          onClick={fetchProfile}
          className="mt-4 rounded-lg bg-mmsu-green px-4 py-2 font-bold text-white"
        >
          Try Again
        </button>
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
          <div className="w-32 h-32 mb-4">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-white outline outline-2 outline-mmsu-green shadow-md"
              />
            ) : (
              <div className="w-full h-full bg-mmsu-gold text-mmsu-green rounded-full flex items-center justify-center text-6xl font-black shadow-md border-4 border-white outline outline-2 outline-mmsu-green">
                {profile.fullName?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>

          <label
            className={`relative mb-5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-mmsu-green focus-within:ring-2 focus-within:ring-mmsu-green ${
              busy ? "opacity-50" : "hover:bg-gray-50"
            }`}
          >
            {uploading ? "Uploading..." : "Change Picture"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label="Change profile picture"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={handleAvatarUpload}
              disabled={busy}
            />
          </label>

          <h3 className="text-xl font-bold text-gray-800 text-center">
            {profile.fullName}
          </h3>

          <p className="text-mmsu-light-green text-sm font-bold mt-1 mb-6">
            {roleLabel}
          </p>

          <div className="bg-gray-50 p-4 rounded-xl w-full text-center border border-gray-200 shadow-inner">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
              Registered Email
            </p>
            <p className="text-sm font-bold text-gray-800 break-all">
              {profile.email || "Not provided"}
            </p>
          </div>
        </div>

        <div className="md:w-2/3">
          <form onSubmit={handleSave}>
            <fieldset disabled={busy} className="flex flex-col gap-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-bold text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="college"
                  className="block text-sm font-bold text-gray-700 mb-1"
                >
                  College
                </label>
                <input
                  id="college"
                  type="text"
                  value={collegeLabel}
                  readOnly
                  aria-describedby="college-help"
                  className="w-full p-4 border border-gray-200 rounded-lg bg-gray-100 text-gray-700"
                />
                <p id="college-help" className="mt-2 text-sm text-gray-500">
                  Contact the main administrator if your college needs
                  correction.
                </p>
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
                  name="contactNum"
                  type="tel"
                  autoComplete="tel"
                  placeholder="e.g. 09123456789"
                  aria-describedby="contact-number-help"
                  required={profile.userType === "visitor"}
                  value={formData.contactNum}
                  onChange={handleChange}
                  className={inputClass}
                />
                <p
                  id="contact-number-help"
                  className="mt-2 text-sm text-gray-500"
                >
                  {profile.userType === "visitor"
                    ? "Required for visitors. "
                    : "Optional. "}
                  Add a phone number so campus administrators can contact you
                  about your reports and claims.
                </p>
              </div>

              {showStudentId && (
                <div>
                  <label
                    htmlFor="studId"
                    className="block text-sm font-bold text-gray-700 mb-1"
                  >
                    Student ID
                  </label>
                  <input
                    id="studId"
                    name="studId"
                    type="text"
                    value={formData.studId}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              )}

              {showEmployeeId && (
                <div>
                  <label
                    htmlFor="employeeId"
                    className="block text-sm font-bold text-gray-700 mb-1"
                  >
                    Employee ID
                  </label>
                  <input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-2 w-full bg-mmsu-green text-white font-bold text-lg py-4 rounded-lg hover:bg-mmsu-light-green transition shadow-md disabled:opacity-50"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}
