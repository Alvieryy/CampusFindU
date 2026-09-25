import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/dashboard";
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* LEFT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-white relative">
        <div className="w-full max-w-md">
          {/* LOGO HEADER */}
          <div className="flex items-center gap-4 mb-2">
            <img
              src="/logo.png"
              alt="CampusFindU Logo"
              className="w-24 h-28 object-contain"
            />
            <h1 className="text-2xl font-black text-mmsu-green tracking-tight leading-tight">
              CampusFindU:
              <br />
              LOST AND FOUND
              <br />
              MANAGEMENT SYSTEM
            </h1>
          </div>

          <p className="text-gray-500 mb-8 font-medium">
            Please log in to continue.
          </p>

          {/* ERROR ALERT */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-bold border border-red-200">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <input
                type="email"
                placeholder="Email or Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition placeholder-gray-400 font-medium bg-gray-50/50"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition placeholder-gray-400 font-medium bg-gray-50/50"
              />
              <img
                src={showPassword ? "/eye.png" : "/hidden.png"}
                alt="Toggle Password Visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 w-6 h-6 cursor-pointer opacity-50 hover:opacity-100 transition"
              />
            </div>

            <div className="flex justify-between items-center text-sm font-bold mt-1">
              <label className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-gray-700 transition">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-mmsu-green focus:ring-mmsu-green"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-mmsu-green hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mmsu-green text-white font-bold text-lg p-4 rounded-lg hover:bg-mmsu-light-green transition shadow-lg mt-4 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* BOTTOM TEXT */}
          <p className="text-center text-gray-500 text-sm mt-10 font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="text-mmsu-green hover:underline">
              Register here
            </Link>
            .<br />
            Need help? Contact your administrator.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: BEAUTIFUL CAMPUS IMAGE */}
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
