import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "host/store";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({}); // Track if user has typed in field
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  // Validate single field
  const validateField = (name, value) => {
    switch (name) {
      case "username":
        if (!value.trim()) return "This field is required.";
        break;
      case "email":
        if (!value.trim()) return "This field is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format.";
        break;
      case "password":
      if (!value.trim()) return "This field is required.";
      if (value.length < 6) return "Password must be at least 6 characters.";
      if (value.length > 30) return "Password cannot exceed 30 characters.";
      if (!/(?=.*[a-z])/.test(value))
        return "Password must include at least one lowercase letter.";
      if (!/(?=.*[A-Z])/.test(value))
        return "Password must include at least one uppercase letter.";
      if (!/(?=.*\d)/.test(value))
        return "Password must include at least one number.";
      if (!/(?=.*[@$!%*?&])/.test(value))
        return "Password must include at least one special character (@$!%*?&).";
      break;

      case "phone":
        if (!value.trim()) return "This field is required.";
        if (!/^\d*$/.test(value)) return "Phone number can only contain digits.";
        if (value.length !== 10) return "Phone number must be 10 digits.";
        break;
      case "address":
        if (!value.trim()) return "This field is required.";
        break;
      default:
        return "";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });
    setTouched({ ...touched, [name]: true });

    // Show error only if user has typed in field
    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields on submit
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const errorMsg = validateField(key, form[key]);
      if (errorMsg) newErrors[key] = errorMsg;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Mark all fields as touched so errors appear
      const allTouched = {};
      Object.keys(form).forEach((key) => (allTouched[key] = true));
      setTouched(allTouched);
      return;
    }

    setErrors({});
    dispatch(registerUser(form))
      .unwrap()
      .then(() => {
        alert("Signup successful!");
        navigate("/login");
      })
      .catch(() => {
        alert("Signup failed. Try again.");
      });
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>

        <div className="signup-grid">
          {["username", "email", "password", "phone", "address"].map((field) => (
            <div
              key={field}
              className="form-group"
              style={field === "address" ? { flex: "1 1 100%" } : {}}
            >
              <label>
                {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                <span className="required">*</span>
              </label>
              {field === "address" ? (
                <textarea
                  name={field}
                  placeholder={`Enter your ${field}`}
                  value={form[field]}
                  onChange={handleChange}
                />
              ) : (
                <input
                  type={field === "password" ? "password" : "text"}
                  name={field}
                  placeholder={`Enter your ${field}`}
                  value={form[field]}
                  onChange={handleChange}
                  maxLength={field === "phone" ? 10 : undefined}
                />
              )}
              {errors[field] && <span className="field-error">{errors[field]}</span>}
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p>
          Already have an account?{" "}
          <span className="link" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Signup;
