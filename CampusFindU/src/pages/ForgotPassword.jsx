import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const redirectUrl =
      window.location.origin.includes("localhost") ||
      window.location.origin.includes("capacitor")
        ? "https://campusfindu.vercel.app/reset-password"
        : `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Success! Check your email for the password reset link.");
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
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-bold border border-red-200">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm font-bold border border-green-200">
              {message}
            </div>
          )}

          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mmsu-green text-white font-bold text-lg p-4 rounded-lg hover:bg-mmsu-light-green transition shadow-lg mt-4 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-8 text-sm font-medium text-gray-500 text-center">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-mmsu-green font-bold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 bg-mmsu-green relative">
        <img
          src="/school.jpg"
          alt="University Campus Building"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-mmsu-green/20 mix-blend-multiply"></div>
      </div>
    </div>
  );
}
