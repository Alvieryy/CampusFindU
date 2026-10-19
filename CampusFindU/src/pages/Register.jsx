import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    userType: "student",
    studId: "",
    employeeId: "",
    contactNum: "",
    college: "",
  });

  const [applySCAdmin, setApplySCAdmin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const inputClass =
    "w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-gray-50/50";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRoleChange = (e) => {
    const userType = e.target.value;

    setFormData((previous) => ({
      ...previous,
      userType,
    }));

    if (userType !== "student") {
      setApplySCAdmin(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const allowedRoles = ["student", "faculty", "visitor"];

    if (!allowedRoles.includes(formData.userType)) {
      setError("Please select a valid registration role.");
      return;
    }

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const isStudent = formData.userType === "student";
    const isEmployee = formData.userType === "faculty";

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

    if (formData.userType === "visitor" && !formData.contactNum.trim()) {
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
            userType: formData.userType,
            studId: isStudent ? formData.studId.trim() : null,
            employeeId: isEmployee ? formData.employeeId.trim() : null,
            contactNum: formData.contactNum.trim(),
            college: isStudent ? formData.college : null,
            apply_sc_admin: isStudent && applySCAdmin,
          },
        },
      });

      if (authError) throw authError;

      await Swal.fire({
        title: "Check your email",
        text:
          isStudent && applySCAdmin
            ? "If this is a new registration, check your email for a confirmation link. Your SC admin application requires main-admin approval. Your account remains a student while pending."
            : "If this is a new registration, check your email for a confirmation link. Check your spam or junk folder too.",
        icon: "success",
        confirmButtonText: "Okay",
        confirmButtonColor: "#0A4222",
      });

      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-5 sm:p-8 lg:p-12 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="mb-8">
            <nav
              aria-label="Account navigation"
              className="flex flex-wrap items-center justify-between gap-3 mb-6 text-sm"
            >
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center gap-2 text-gray-500 font-bold hover:text-mmsu-green focus-visible:outline-2 focus-visible:outline-mmsu-green rounded-lg"
              >
                <span aria-hidden="true">&larr;</span>
                Back to Login
              </Link>

              <Link
                to="/admin/login"
                className="ml-auto inline-flex min-h-11 items-center justify-center rounded-lg border border-mmsu-green/20 px-4 py-2 font-bold text-mmsu-green hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-mmsu-green transition"
              >
                Log in as admin
              </Link>
            </nav>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-6 sm:mb-2 text-center sm:text-left">
              <img
                src="/logo.png"
                alt="CampusFindU Logo"
                className="w-16 h-20 object-contain"
              />

              <h1 className="text-2xl sm:text-3xl font-black text-mmsu-green tracking-tight mt-2 sm:mt-0">
                Create an Account
              </h1>
            </div>

            <p className="text-gray-500 font-medium">
              Join CampusFindU: Lost and Found Management System.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-bold border border-red-200"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <fieldset
              disabled={loading}
              className="flex flex-col gap-4 disabled:opacity-70"
            >
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
                  required
                  placeholder="e.g. Juan Dela Cruz"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="userType"
                  className="block text-sm font-bold text-gray-700 mb-1"
                >
                  Role
                </label>

                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleRoleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-white"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="visitor">Visitor</option>
                </select>
              </div>

              {formData.userType === "student" && (
                <>
                  <div>
                    <label
                      htmlFor="college"
                      className="block text-sm font-bold text-gray-700 mb-1"
                    >
                      College
                    </label>

                    <select
                      id="college"
                      name="college"
                      required
                      value={formData.college}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-mmsu-green focus:border-mmsu-green transition bg-white"
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

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <label
                      htmlFor="applySCAdmin"
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <input
                        id="applySCAdmin"
                        type="checkbox"
                        checked={applySCAdmin}
                        onChange={(e) => setApplySCAdmin(e.target.checked)}
                        aria-describedby="sc-admin-help"
                        className="mt-1 h-4 w-4"
                      />

                      <span className="font-bold text-gray-800">
                        Apply as College SC Admin
                      </span>
                    </label>

                    <p
                      id="sc-admin-help"
                      className="mt-2 text-sm text-gray-600"
                    >
                      Apply only when you're a Student Council officer. Your
                      account will remain a student account until the main
                      administrator approves your application.
                    </p>
                  </div>

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
                      required
                      placeholder="2X-140XXX"
                      value={formData.studId}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {formData.userType === "faculty" && (
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
                    required
                    placeholder="e.g. EMP-001234"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              )}

              {formData.userType === "visitor" && (
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
                    required
                    placeholder="e.g. 09123456789"
                    value={formData.contactNum}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-gray-700 mb-1"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="e.g. juan@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-gray-700 mb-1"
                >
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
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg opacity-60 hover:opacity-100 transition"
                  >
                    <img
                      src={showPassword ? "/eye.png" : "/hidden.png"}
                      alt=""
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mmsu-green text-white font-bold text-lg p-4 rounded-lg hover:bg-mmsu-light-green transition shadow-lg mt-4 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Register"}
              </button>
            </fieldset>
          </form>

          <div className="text-center text-gray-500 text-sm mt-8 font-medium flex flex-col gap-1">
            <p className="text-xs">
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
          alt="School Campus"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-mmsu-green/20 mix-blend-multiply" />
      </div>
    </div>
  );
}
