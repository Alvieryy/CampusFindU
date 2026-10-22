import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import Swal from "../utils/swal";

export default function Login({ adminOnly = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("timeout") === "true") {
      Swal.fire({
        title: "Session Expired",
        text: "You were automatically logged out due to 15 minutes of inactivity for your security.",
        icon: "info",
        confirmButtonColor: "#0A4222",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      if (adminOnly) {
        const { data: profile, error: profileError } = await supabase
          .from("Users")
          .select("userType")
          .eq("id", data.user.id)
          .single();

        if (profileError || profile?.userType !== "admin") {
          await supabase.auth.signOut();
          setError(
            profileError
              ? "Unable to verify administrator access. Please try again."
              : "This login is for administrator accounts only.",
          );
          return;
        }
      }

      await supabase
        .from("Users")
        .update({ is_online: true })
        .eq("id", data.user.id);
      window.location.href = "/dashboard";
    } catch {
      setError("Unable to log in. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const isCapacitor =
      window.location.protocol === "capacitor:" ||
      (window.location.hostname === "localhost" && !window.location.port);

    const redirectUrl = isCapacitor
      ? "https://campusfindu.vercel.app/auth/callback"
      : `${window.location.origin}/auth/callback`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-5 sm:p-8 lg:p-24 bg-white relative">
        <div className="w-full max-w-md">
          <nav
            aria-label="Account navigation"
            className="flex justify-end mb-6"
          >
            <Link
              to={adminOnly ? "/login" : "/admin/login"}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-mmsu-green/20 px-4 py-2 text-sm font-bold text-mmsu-green hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-mmsu-green transition"
            >
              {adminOnly ? "Back to user login" : "Log in as admin"}
            </Link>
          </nav>

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

          <p className="text-gray-500 mb-8 font-medium">
            {adminOnly
              ? "Administrator login — sign in with your admin account."
              : "Please log in to continue."}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-bold border border-red-200">
              {error}
            </div>
          )}

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
              {loading
                ? "Logging in..."
                : adminOnly
                ? "Log in as admin"
                : "Login"}
            </button>

            {!adminOnly && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-400 font-bold uppercase tracking-wider">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 p-3.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm font-bold text-gray-700 bg-white"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </>
            )}
          </form>

          <div className="text-center text-gray-500 text-sm mt-10 font-medium flex flex-col gap-1">
            {!adminOnly && (
              <p>
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-mmsu-green font-bold hover:underline"
                >
                  Register here
                </Link>
              </p>
            )}
            <p className="mt-4 text-xs">
              &copy; {new Date().getFullYear()} CampusFindU. Batac City, Ilocos
              Norte
            </p>
            <p className="text-xs mt-1">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=libedmonalvier@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-mmsu-green transition-colors"
              >
                Contact Developer
              </a>
            </p>
          </div>
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
