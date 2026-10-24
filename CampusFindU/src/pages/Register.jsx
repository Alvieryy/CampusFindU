import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../utils/toast";

const colleges = [
  ["CCIS", "College of Computing and Information Sciences"],
  ["COE", "College of Engineering"],
  ["CAS", "College of Arts and Sciences"],
  ["CAFSD", "College of Agriculture Food and Sustainable Development"],
  ["CASAT", "College of Aquatic Science and Applied Technology"],
  ["CBEA", "College of Business, Economics and Accountancy"],
  ["CHS", "College of Health Sciences"],
  ["CIT", "College of Industrial Technology"],
  ["CTE", "College of Teacher Education"],
  ["COM", "College of Medicine"],
  ["COL", "College of Law"],
  ["COD", "College of Dentistry"],
  ["CVM", "College of Veterinary Medicine"],
  ["GS", "College of Graduate School"],
];

export default function Register({ guestOnly = false }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    userType: guestOnly ? "visitor" : "student",
    studId: "",
    employeeId: "",
    contactNum: "",
    college: "",
  });

  const [applySCAdmin, setApplySCAdmin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const userType = guestOnly ? "visitor" : formData.userType;
  const isStudent = userType === "student";
  const isEmployee = userType === "faculty";
  const isVisitor = userType === "visitor";
  const loginPath = guestOnly ? "/guest/login" : "/login";

  const inputClass =
    "w-full min-h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-mmsu-green focus:ring-2 focus:ring-green-100 disabled:opacity-60";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRoleChange = (e) => {
    const nextRole = e.target.value;

    setFormData((previous) => ({
      ...previous,
      userType: nextRole,
    }));

    if (nextRole !== "student") {
      setApplySCAdmin(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const allowedRoles = guestOnly
      ? ["visitor"]
      : ["student", "faculty", "visitor"];

    if (!allowedRoles.includes(userType)) {
      setError("Please select a valid registration role.");
      return;
    }

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (isStudent && !colleges.some(([code]) => code === formData.college)) {
      setError("Please select your college.");
      return;
    }

    if (isStudent && !formData.studId.trim()) {
      setError("Please enter your student ID.");
      return;
    }

    if (isEmployee && !formData.employeeId.trim()) {
      setError("Please enter your employee ID.");
      return;
    }

    if (isVisitor && !formData.contactNum.trim()) {
      setError("Please enter your contact number.");
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            fullName: formData.fullName.trim(),
            userType,
            studId: isStudent ? formData.studId.trim() : null,
            employeeId: isEmployee ? formData.employeeId.trim() : null,
            contactNum: formData.contactNum.trim(),
            college: isStudent ? formData.college : null,
            apply_sc_admin: isStudent && applySCAdmin,
          },
        },
      });

      if (authError) throw authError;

      Toast.fire({
        title: "Check your email",
        text:
          isStudent && applySCAdmin
            ? "If this is a new registration, check your email for a confirmation link. Your SC admin application requires main-admin approval. Your account remains a student while pending."
            : "If this is a new registration, check your email for a confirmation link. Check your spam or junk folder too.",
        icon: "success",
      });

      navigate(loginPath);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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

      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/30" />

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
              MMSU Lost and Found
            </span>
          </span>
        </Link>

        <Link
          to={loginPath}
          className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-sm"
        >
          Back to Login
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <section
          aria-label={guestOnly ? "Guest registration" : "Account registration"}
          className="w-full max-w-lg rounded-3xl border border-white/50 bg-white/75 p-6 shadow-2xl backdrop-blur-md sm:p-9"
        >
          <div className="mb-6 text-center">
            <img
              src="/logo.png"
              alt="CampusFindU"
              className="mx-auto h-20 w-16 object-contain"
            />

            <h1 className="mt-4 text-xl font-bold tracking-wide text-mmsu-green">
              REGISTRATION
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

          <form onSubmit={handleRegister}>
            <fieldset
              disabled={loading}
              className="space-y-5 disabled:opacity-70"
            >
              <div>
                <label htmlFor="fullName" className={labelClass}>
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="e.g. Juan Dela Cruz"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {!guestOnly && (
                <div>
                  <label htmlFor="userType" className={labelClass}>
                    Role
                  </label>

                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleRoleChange}
                    className={inputClass}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="visitor">Visitor</option>
                  </select>
                </div>
              )}

              {isStudent && (
                <>
                  <div>
                    <label htmlFor="college" className={labelClass}>
                      College
                    </label>

                    <select
                      id="college"
                      name="college"
                      required
                      value={formData.college}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select your college
                      </option>

                      {colleges.map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="studId" className={labelClass}>
                      Student ID
                    </label>

                    <input
                      id="studId"
                      name="studId"
                      type="text"
                      required
                      placeholder="2X-140XXX"
                      value={formData.studId}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="rounded-xl border border-gray-300 bg-transparent p-4">
                    <label
                      htmlFor="applySCAdmin"
                      className="flex cursor-pointer items-start gap-3"
                    >
                      <input
                        id="applySCAdmin"
                        type="checkbox"
                        checked={applySCAdmin}
                        onChange={(e) => setApplySCAdmin(e.target.checked)}
                        aria-describedby="sc-admin-help"
                        className="mt-1 h-4 w-4 accent-green-800"
                      />

                      <span className="text-sm font-semibold text-gray-800">
                        Apply as College SC Admin
                      </span>
                    </label>

                    <p
                      id="sc-admin-help"
                      className="mt-2 text-xs leading-relaxed text-gray-600"
                    >
                      Apply only when you're a Student Council officer. Your
                      account will remain a student account until the main
                      administrator approves your application.
                    </p>
                  </div>
                </>
              )}

              {isEmployee && (
                <div>
                  <label htmlFor="employeeId" className={labelClass}>
                    Employee ID
                  </label>

                  <input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    required
                    placeholder="e.g. EMP-001234"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              )}

              {isVisitor && (
                <div>
                  <label htmlFor="contactNum" className={labelClass}>
                    Contact Number
                  </label>

                  <input
                    id="contactNum"
                    name="contactNum"
                    type="tel"
                    autoComplete="tel"
                    required
                    placeholder="e.g. 09123456789"
                    value={formData.contactNum}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
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

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-mmsu-green px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-mmsu-light-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mmsu-green disabled:cursor-wait disabled:opacity-60"
              >
                {loading
                  ? "Creating Account..."
                  : guestOnly
                  ? "Register as Guest"
                  : "Create Account"}
              </button>
            </fieldset>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to={loginPath}
              className="font-bold text-mmsu-green hover:underline"
            >
              Sign in
            </Link>
          </p>

          {guestOnly && (
            <p className="mt-3 text-center">
              <Link
                to="/register"
                className="text-sm font-semibold text-gray-500 hover:text-mmsu-green"
              >
                Student or faculty registration
              </Link>
            </p>
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
