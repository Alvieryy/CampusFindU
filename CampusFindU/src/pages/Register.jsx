import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    userType: "student", // Default role
    studId: "",
    employeeId: "",
    contactNum: "",
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // supabase sign up user
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
       
        data: {
          full_name: formData.fullName,
          user_type: formData.userType, 
          stud_id: formData.userType === "student" ? formData.studId : null,
          employee_id: ["faculty", "staff", "admin"].includes(formData.userType)
            ? formData.employeeId
            : null,
          contact_num: formData.contactNum,
        },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      alert("Registration successful! You can now log in.");
      navigate("/login");
    }
  };
  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleRegister}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Full Name"
          required
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />

        {/* Role Selection Dropdown */}
        <select
          value={formData.userType}
          onChange={(e) =>
            setFormData({ ...formData, userType: e.target.value })
          }
          style={{ padding: "8px" }}
        >
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="staff">Staff</option>
          <option value="visitor">Visitor</option>
          <option value="admin">Admin</option>
        </select>
        {/* Conditionally show fields based on the selected role */}
        {formData.userType === "student" && (
          <input
            type="text"
            placeholder="Student ID"
            required
            onChange={(e) =>
              setFormData({ ...formData, studId: e.target.value })
            }
          />
        )}

        {["faculty", "staff", "admin"].includes(formData.userType) && (
          <input
            type="text"
            placeholder="Employee ID"
            required
            onChange={(e) =>
              setFormData({ ...formData, employeeId: e.target.value })
            }
          />
        )}

        <input
          type="text"
          placeholder="Contact Number"
          required
          onChange={(e) =>
            setFormData({ ...formData, contactNum: e.target.value })
          }
        />

        <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
