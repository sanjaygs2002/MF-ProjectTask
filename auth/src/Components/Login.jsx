import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "host/store";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";
import {
  EMAIL_REQUIRED,
  INVALID_EMAIL_FORMAT,
  PASSWORD_REQUIRED,
  PASSWORD_MIN_LENGTH,
  ERROR_INCORRECT_PASSWORD,
  ERROR_USER_NOT_FOUND,
  ERROR_LOGIN_FAILED,
  ERROR_INCORRECT_PASSWORD_UI,
  ERROR_USER_NOT_REGISTERED,
  LABEL_LOGIN,
  LABEL_EMAIL,
  LABEL_PASSWORD,
  LABEL_SIGNUP_PROMPT,
  LABEL_SIGNUP_LINK,
  LABEL_LOGGING_IN,
  LABEL_LOGIN_BUTTON,
  EMAIL_REGEX,
  MIN_PASSWORD_LENGTH,
  DEFAULT_REDIRECT,
} from "../Constant/LoginConst";

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

  React.useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, redirectTo]);

  const validateField = (name, value) => {
    if (name === "email") {
      if (!value) return EMAIL_REQUIRED;
      if (!EMAIL_REGEX.test(value)) return INVALID_EMAIL_FORMAT;
    }
    if (name === "password") {
      if (!value) return PASSWORD_REQUIRED;
      if (value.length < MIN_PASSWORD_LENGTH)
        return PASSWORD_MIN_LENGTH;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: validateField(name, value) });
    setBackendError("");
  };

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

    dispatch(loginUser(form))
      .unwrap()
      .then(() => {
        navigate(redirectTo, { replace: true });
      })
      .catch((err) => {
        if (err.message === ERROR_INCORRECT_PASSWORD) {
          setBackendError(ERROR_INCORRECT_PASSWORD_UI);
        } else if (err.message === ERROR_USER_NOT_FOUND) {
          setBackendError(ERROR_USER_NOT_REGISTERED);
        } else {
          setBackendError(ERROR_LOGIN_FAILED);
        }
      });
  };

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
