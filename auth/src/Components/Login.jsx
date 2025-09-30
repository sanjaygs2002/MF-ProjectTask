import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "host/store";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState(""); // New state for login errors
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, user } = useSelector((state) => state.auth || {});

  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/";

  React.useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, redirectTo]);

  const validateField = (name, value) => {
    if (name === "email") {
      if (!value) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Invalid email format.";
    }
    if (name === "password") {
      if (!value) return "Password is required.";
      if (value.length < 6) return "Password must be at least 6 characters.";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // live validation
    setErrors({ ...errors, [name]: validateField(name, value) });
    setBackendError(""); // Clear backend error on typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Frontend validation
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const msg = validateField(key, form[key]);
      if (msg) newErrors[key] = msg;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setBackendError("");

    // Dispatch login
    dispatch(loginUser(form))
      .unwrap()
      .then(() => {
        navigate(redirectTo, { replace: true });
      })
      .catch((err) => {
        // Backend returns an error: check if email exists but password is wrong
        if (err.message === "Incorrect password") {
          setBackendError("Incorrect password for this email.");
        } else if (err.message === "User not found") {
          setBackendError("Email not registered.");
        } else {
          setBackendError("Login failed. Please try again.");
        }
      });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}
        </div>

        {backendError && <div className="backend-error">{backendError}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don’t have an account?{" "}
          <span className="link" onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
