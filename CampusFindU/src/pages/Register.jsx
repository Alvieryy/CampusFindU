import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    userType: "student",
    studId: "",
    contactNum: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData?.user) {
      const { error: dbError } = await supabase.from("Users").upsert([
        {
          id: authData.user.id,
          fullName: formData.fullName,
          userType: formData.userType,
          studId: formData.userType === "student" ? formData.studId : null,
          employeeId:
            formData.userType === "faculty" ? formData.employeeId : null,
          contactNum: formData.contactNum,
          email: formData.email, // <--- ADD THIS LINE HERE!
        },
      ]);

      if (dbError) setError(dbError.message);
      else {
        Swal.fire({
          title: "Success!",
          text: "Registration successful! You can now log in.",
          icon: "success",
          confirmButtonText: "Awesome",
          confirmButtonColor: "#2563eb", // This makes the button match your CampusFindU Blue!
        });
        navigate("/login");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* LEFT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="mb-8">
            <Link
              to="/login"
              className="text-gray-400 font-bold hover:text-mmsu-green transition flex items-center gap-2 mb-6"
            >
              <span>&larr;</span> Back to Login
            </Link>

            <div className="flex items-center gap-3 mb-2">
              <img
                src="/logo.png"
                alt="CampusFindU Logo"
                className="w-16 h-20 object-contain"
              />
              <h1 className="text-3xl font-black text-mmsu-green tracking-tight">
                Create an Account
              </h1>
            </div>

            <p className="text-gray-500 font-medium">
              Join CampusFindU: Lost and Found Management System.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-bold border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.userType}
                onChange={(e) =>
                  setFormData({ ...formData, userType: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-white"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
                <option value="visitor">Visitor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {formData.userType !== "visitor" && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {formData.userType === "student"
                    ? "Student ID"
                    : "Employee ID"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.studId}
                  onChange={(e) =>
                    setFormData({ ...formData, studId: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                required
                value={formData.contactNum}
                onChange={(e) =>
                  setFormData({ ...formData, contactNum: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50"
                />
                <img
                  src={showPassword ? "/eye.png" : "/hidden.png"}
                  alt="Toggle Password Visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 w-5 h-5 cursor-pointer opacity-50 hover:opacity-100 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mmsu-green text-white font-bold text-lg p-4 rounded-lg hover:bg-mmsu-light-green transition shadow-lg mt-4 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE: YOUR SCHOOL IMAGE */}
      <div className="hidden lg:block lg:w-1/2 bg-mmsu-green relative">
        <img
          src="/school.jpg"
          alt="School Campus"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-mmsu-green/20 mix-blend-multiply"></div>
      </div>
    </div>
  );
}
