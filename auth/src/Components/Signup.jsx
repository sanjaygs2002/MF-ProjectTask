import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "host/store";
import { useNavigate } from "react-router-dom";
import {
  EMAIL_REGEX,
  PHONE_REGEX,
  PASSWORD_LOWERCASE,
  PASSWORD_UPPERCASE,
  PASSWORD_NUMBER,
  PASSWORD_SPECIAL_CHAR,
  PHONE_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  LOGIN_ROUTE,
  STRINGS,
} from "../Constant/SignUpConst";
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
  const [touched, setTouched] = useState({});
  const [tooltip, setTooltip] = useState({ message: "", type: "" }); // ✅ Tooltip state

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  // ✅ Tooltip display
  const showTooltip = (message, type = "success") => {
    setTooltip({ message, type });
    setTimeout(() => setTooltip({ message: "", type: "" }), 2500); // auto hide after 2.5s
  };

  // ✅ Validation function
  const validateField = (name, value) => {
    switch (name) {
      case "username":
        if (!value.trim()) return STRINGS.REQUIRED_FIELD;
        break;
      case "email":
        if (!value.trim()) return STRINGS.REQUIRED_FIELD;
        if (!EMAIL_REGEX.test(value)) return STRINGS.INVALID_EMAIL;
        break;
      case "password":
        if (!value.trim()) return STRINGS.REQUIRED_FIELD;
        if (value.length < PASSWORD_MIN_LENGTH) return STRINGS.PASSWORD_MIN;
        if (value.length > PASSWORD_MAX_LENGTH) return STRINGS.PASSWORD_MAX;
        if (!PASSWORD_LOWERCASE.test(value)) return STRINGS.PASSWORD_LOWERCASE;
        if (!PASSWORD_UPPERCASE.test(value)) return STRINGS.PASSWORD_UPPERCASE;
        if (!PASSWORD_NUMBER.test(value)) return STRINGS.PASSWORD_NUMBER;
        if (!PASSWORD_SPECIAL_CHAR.test(value))
          return STRINGS.PASSWORD_SPECIAL;
        break;
      case "phone":
        if (!value.trim()) return STRINGS.REQUIRED_FIELD;
        if (!PHONE_REGEX.test(value)) return STRINGS.INVALID_PHONE;
        if (value.length !== PHONE_LENGTH) return STRINGS.PHONE_LENGTH;
        break;
      case "address":
        if (!value.trim()) return STRINGS.REQUIRED_FIELD;
        break;
      default:
        return "";
    }
    return "";
  };

  // ✅ Handle change with phone number restriction
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent alphabets in phone input
    if (name === "phone") {
      const filtered = value.replace(/\D/g, ""); // allow only digits
      setForm({ ...form, [name]: filtered });
    } else {
      setForm({ ...form, [name]: value });
    }

    setTouched({ ...touched, [name]: true });
    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  // ✅ Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const msg = validateField(key, form[key]);
      if (msg) newErrors[key] = msg;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const allTouched = {};
      Object.keys(form).forEach((key) => (allTouched[key] = true));
      setTouched(allTouched);
      return;
    }

    dispatch(registerUser(form))
      .unwrap()
      .then(() => {
        showTooltip(STRINGS.SIGNUP_SUCCESS, "success");
        setTimeout(() => navigate(LOGIN_ROUTE), 2000);
      })
      .catch(() => {
        showTooltip(STRINGS.SIGNUP_FAILED, "error");
      });
  };

  return (
    <div className="signup-container">
      {/* ✅ Tooltip Notification */}
      {tooltip.message && (
        <div className={`tooltip ${tooltip.type}`}>
          {tooltip.message}
        </div>
      )}

      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>{STRINGS.SIGNUP_TITLE}</h2>

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
                  maxLength={field === "phone" ? PHONE_LENGTH : undefined}
                />
              )}

              {errors[field] && (
                <span className="field-error">{errors[field]}</span>
              )}
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? STRINGS.BUTTON_LOADING : STRINGS.BUTTON_SIGNUP}
        </button>

        <p>
          {STRINGS.ALREADY_HAVE_ACCOUNT}{" "}
          <span className="link" onClick={() => navigate(LOGIN_ROUTE)}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Signup;
