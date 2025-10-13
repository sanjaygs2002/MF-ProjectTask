import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "host/store";
import { useNavigate, useLocation } from "react-router-dom";
import TagManager from "react-gtm-module";
import "./Login.css";

// --- Local constants (kept in same file) ---
const EMAIL_REQUIRED = "Email is required.";
const INVALID_EMAIL_FORMAT = "Invalid email format.";
const PASSWORD_REQUIRED = "Password is required.";
const PASSWORD_MIN_LENGTH = "Password must be at least 6 characters.";
const ERROR_INCORRECT_PASSWORD = "Incorrect password";
const ERROR_USER_NOT_FOUND = "User not found";
const ERROR_LOGIN_FAILED = "Login failed. Please try again.";
const ERROR_INCORRECT_PASSWORD_UI = "Incorrect password. Try again.";
const ERROR_USER_NOT_REGISTERED = "User not registered.";
const LABEL_LOGIN = "Login";
const LABEL_EMAIL = "Email";
const LABEL_PASSWORD = "Password";
const LABEL_SIGNUP_PROMPT = "Don't have an account?";
const LABEL_SIGNUP_LINK = "Register here";
const LABEL_LOGGING_IN = "Logging in...";
const LABEL_LOGIN_BUTTON = "Login";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const DEFAULT_REDIRECT = "/";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, user } = useSelector((state) => state.auth || {});

  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || DEFAULT_REDIRECT;

  // ✅ Track page view event via GTM
  useEffect(() => {
    TagManager.dataLayer({
      dataLayer: {
        event: "login_page_view",
        page_path: location.pathname,
        page_title: "Login Page",
      },
    });
    console.log("📊 GTM Event: login_page_view");
  }, [location]);

  // ✅ When user logs in successfully
  useEffect(() => {
    if (user) {
      TagManager.dataLayer({
        dataLayer: {
          event: "login_success",
          user_email: user.email,
          timestamp: new Date().toISOString(),
        },
      });
      console.log("✅ GTM Event: login_success");
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, redirectTo]);

  // --- Validation logic ---
  const validateField = (name, value) => {
    if (name === "email") {
      if (!value) return EMAIL_REQUIRED;
      if (!EMAIL_REGEX.test(value)) return INVALID_EMAIL_FORMAT;
    }
    if (name === "password") {
      if (!value) return PASSWORD_REQUIRED;
      if (value.length < MIN_PASSWORD_LENGTH) return PASSWORD_MIN_LENGTH;
    }
    return "";
  };

  // --- Input change handler ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: validateField(name, value) });
    setBackendError("");

    // ✅ GTM: Field input
    TagManager.dataLayer({
      dataLayer: {
        event: "login_field_input",
        field_name: name,
        timestamp: new Date().toISOString(),
      },
    });
    console.log("✏️ GTM Event: login_field_input");
  };

  // --- Form submit handler ---
  const handleSubmit = (e) => {
    e.preventDefault();

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

    // ✅ GTM: Login attempt
    TagManager.dataLayer({
      dataLayer: {
        event: "login_attempt",
        user_email: form.email,
        timestamp: new Date().toISOString(),
      },
    });
    console.log("🚀 GTM Event: login_attempt");

    dispatch(loginUser(form))
      .unwrap()
      .then(() => {
        TagManager.dataLayer({
          dataLayer: {
            event: "login_success",
            user_email: form.email,
            timestamp: new Date().toISOString(),
          },
        });
        console.log("✅ GTM Event: login_success");
        navigate(redirectTo, { replace: true });
      })
      .catch((err) => {
        let errorMessage = ERROR_LOGIN_FAILED;
        if (err.message === ERROR_INCORRECT_PASSWORD) {
          errorMessage = ERROR_INCORRECT_PASSWORD_UI;
          setBackendError(ERROR_INCORRECT_PASSWORD_UI);
        } else if (err.message === ERROR_USER_NOT_FOUND) {
          errorMessage = ERROR_USER_NOT_REGISTERED;
          setBackendError(ERROR_USER_NOT_REGISTERED);
        } else {
          setBackendError(ERROR_LOGIN_FAILED);
        }

        // ✅ GTM: Login failed
        TagManager.dataLayer({
          dataLayer: {
            event: "login_failed",
            user_email: form.email,
            error_message: errorMessage,
            timestamp: new Date().toISOString(),
          },
        });
        console.log("❌ GTM Event: login_failed");
      });
  };

  // --- JSX ---
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{LABEL_LOGIN}</h2>

        <div className="form-group">
          <label>
            {LABEL_EMAIL} <span className="required">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>
            {LABEL_PASSWORD} <span className="required">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}
        </div>

        {backendError && <div className="backend-error">{backendError}</div>}

        <button type="submit" disabled={loading}>
          {loading ? LABEL_LOGGING_IN : LABEL_LOGIN_BUTTON}
        </button>

        <p>
          {LABEL_SIGNUP_PROMPT}{" "}
          <span className="link" onClick={() => navigate("/signup")}>
            {LABEL_SIGNUP_LINK}
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
