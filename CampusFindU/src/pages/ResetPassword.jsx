import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../utils/toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("error")) {
      setError(
        hashParams.get("error_description") ||
          "The password reset link is invalid or has expired.",
      );
    }
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      Toast.fire({
        title: "Password Updated!",
        text: "Your password has been successfully changed.",
        icon: "success",
      });
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="mb-8">
            <Link
              to="/login"
              className="text-gray-400 font-bold hover:text-mmsu-green transition flex items-center gap-2 mb-6"
            >
              <span>&larr;</span> Back to Login
            </Link>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 sm:mb-2 text-center sm:text-left">
              <img
                src="/logo.png"
                alt="CampusFindU Logo"
                className="w-20 h-24 sm:w-24 sm:h-28 object-contain"
              />
              <h1 className="text-xl sm:text-2xl font-black text-mmsu-green tracking-tight leading-tight mt-2 sm:mt-0">
                CampusFindU:
                <br />
                LOST AND FOUND
                <br />
                MANAGEMENT SYSTEM
              </h1>
            </div>

            <p className="text-gray-500 font-medium mt-4">
              Create a new secure password for your account.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-bold border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-4 pr-10 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50"
                />
                <img
                  src={showPassword ? "/eye.png" : "/hidden.png"}
                  alt="Toggle Password Visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 w-6 h-6 cursor-pointer opacity-50 hover:opacity-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-4 pr-10 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50"
                />
                <img
                  src={showConfirmPassword ? "/eye.png" : "/hidden.png"}
                  alt="Toggle Password Visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4 w-6 h-6 cursor-pointer opacity-50 hover:opacity-100 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mmsu-green text-white font-bold text-lg p-4 rounded-lg hover:bg-mmsu-light-green transition shadow-lg mt-4 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 bg-mmsu-green relative">
        <img
          src="/school.jpg"
          alt="University Campus Building"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-mmsu-green/20 mix-blend-multiply"></div>
      </div>
    </div>
  );
}
