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

  const inputClass =
    "w-full min-h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-mmsu-green focus:ring-2 focus:ring-green-100 disabled:opacity-60";

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
    <div className="relative isolate flex min-h-screen flex-col bg-mmsu-green font-sans">
      <img
        src="/school.jpg"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="fixed inset-0 -z-20 h-full w-full object-cover"
      />

      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-br from-green-950/90 via-green-950/65 to-black/50"
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
          to="/login"
          className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-sm"
        >
          Back to Login
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <section
          aria-label="Reset password"
          className="w-full max-w-md rounded-3xl border border-white/50 bg-white/75 p-6 shadow-2xl backdrop-blur-md sm:p-9"
        >
          <div className="mb-6 text-center">
            <img
              src="/logo.png"
              alt="CampusFindU"
              className="mx-auto h-20 w-16 object-contain"
            />

            <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-wide text-mmsu-green">
              RESET PASSWORD
            </h1>

            <p className="mt-2 text-sm font-medium text-gray-600">
              Create a new secure password for your account.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            <fieldset disabled={loading} className="space-y-5">
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="new-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`${inputClass} pr-14`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
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

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`${inputClass} pr-14`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showConfirmPassword}
                    className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mmsu-green"
                  >
                    <img
                      src={showConfirmPassword ? "/eye.png" : "/hidden.png"}
                      alt=""
                      className="h-5 w-5 opacity-60"
                    />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-mmsu-green px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-mmsu-light-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mmsu-green disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? "Updating password..." : "Reset Password"}
              </button>
            </fieldset>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-500">
            Back to{" "}
            <Link
              to="/login"
              className="font-bold text-mmsu-green hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mmsu-green"
            >
              Sign in
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
