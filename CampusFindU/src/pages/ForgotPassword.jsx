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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Success! Check your email for the password reset link.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4 relative">
      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <Link
          to="/login"
          className="text-mmsu-green font-bold hover:underline flex items-center gap-2"
        >
          <span>&larr;</span> Back to Login
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-mmsu-green mb-2">
          Forgot Password
        </h2>
        <p className="text-gray-500 text-sm mb-8 px-4">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

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

        <form onSubmit={handleReset} className="flex flex-col gap-5 text-left">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
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
            className="w-full bg-mmsu-green text-white font-bold text-lg p-4 rounded-lg hover:bg-mmsu-light-green transition shadow-md mt-2 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-8 text-sm font-medium text-gray-500">
          Remember your password?{" "}
          <Link to="/login" className="text-mmsu-green hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
