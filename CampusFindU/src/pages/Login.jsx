import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import Toast from "../utils/toast";

export default function Login({ adminOnly = false, guestOnly = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputClass =
    "w-full min-h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-mmsu-green focus:ring-2 focus:ring-green-100 disabled:opacity-60";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("timeout") === "true") {
      Toast.fire({
        title: "Session Expired",
        text: "You were automatically logged out due to 15 minutes of inactivity. Please sign in again.",
        icon: "info",
      });

      params.delete("timeout");
      const query = params.toString();

      window.history.replaceState(
        window.history.state,
        document.title,
        `${window.location.pathname}${query ? `?${query}` : ""}${
          window.location.hash
        }`,
      );
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password,
        },
      );

      if (authError) throw authError;

      if (adminOnly || guestOnly) {
        const { data: profile, error: profileError } = await supabase
          .from("Users")
          .select("userType")
          .eq("id", data.user.id)
          .single();

        const requiredRole = adminOnly ? "admin" : "visitor";

        if (profileError || profile?.userType !== requiredRole) {
          const { error: signOutError } = await supabase.auth.signOut();

          if (signOutError) throw signOutError;

          setError(
            profileError
              ? "Unable to verify your account type. Please try again."
              : adminOnly
              ? "This login is for administrator accounts only."
              : "This login is for visitor accounts. Students and faculty should use the main login.",
          );

          return;
        }
      }

      const { error: onlineError } = await supabase
        .from("Users")
        .update({ is_online: true })
        .eq("id", data.user.id);

      if (onlineError) {
        console.error("Unable to update online status:", onlineError);
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err.message ||
          "Unable to log in. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
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

      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message || "Unable to connect to Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-mmsu-green font-sans">
      <img
        src="/school.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-green-950/90 via-green-950/65 to-black/50"
      />

      <header className="flex items-center justify-between gap-4 px-5 py-5 sm:px-10">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <img src="/logo.png" alt="" className="h-12 w-10 object-contain" />

          <span>
            <span className="block text-lg font-extrabold tracking-tight">
              CampusFindU
            </span>

            <span className="block text-xs text-green-100">
              Lost and Found Management System
            </span>
          </span>
        </Link>

        <Link
          to={adminOnly || guestOnly ? "/login" : "/admin/login"}
          className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-sm"
        >
          {adminOnly || guestOnly ? "Main Login" : "Admin Login"}
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <section
          aria-label={
            adminOnly
              ? "Administrator login"
              : guestOnly
              ? "Guest login"
              : "Login"
          }
          className="w-full max-w-md rounded-3xl border border-white/50 bg-white/75 p-6 shadow-2xl backdrop-blur-md sm:p-9"
        >
          <div className="mb-6 text-center">
            <img
              src="/logo.png"
              alt="CampusFindU"
              className="mx-auto h-20 w-16 object-contain"
            />

            <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-wide text-mmsu-green">
              LOG IN
            </h1>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <fieldset disabled={loading} className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`${inputClass} pr-14`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mmsu-green"
                  >
                    <img
                      src={showPassword ? "/eye.png" : "/hidden.png"}
                      alt=""
                      className="h-5 w-5 opacity-60"
                    />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-mmsu-green hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-mmsu-green px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-mmsu-light-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mmsu-green disabled:cursor-wait disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : adminOnly
                  ? "Sign in as Admin"
                  : guestOnly
                  ? "Sign in as Guest"
                  : "Sign in"}
              </button>
            </fieldset>
          </form>

          {!adminOnly && !guestOnly && (
            <>
              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
                Continue with Google
              </button>

              <Link
                to="/guest/login"
                className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Visitor / Guest Login
              </Link>
            </>
          )}

          {!adminOnly && (
            <p className="mt-6 text-center text-sm leading-relaxed text-gray-500">
              {guestOnly ? "New visitor?" : "Don't have an account?"}{" "}
              <Link
                to={guestOnly ? "/guest/register" : "/register"}
                className="font-bold text-mmsu-green hover:underline"
              >
                {guestOnly ? "Register as a guest" : "Create an account"}
              </Link>
            </p>
          )}

          {(adminOnly || guestOnly) && (
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-500 hover:text-mmsu-green"
              >
                ← Back to main login
              </Link>
            </div>
          )}
        </section>
      </main>

      <footer className="px-5 pb-6 text-center text-xs leading-relaxed text-green-100">
        <p>
          © {new Date().getFullYear()} CampusFindU · Batac City, Ilocos Norte
        </p>

        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=libedmonalvier@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block hover:text-white hover:underline"
        >
          Contact Developer
        </a>
      </footer>
    </div>
  );
}
