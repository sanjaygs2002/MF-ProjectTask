// auth/src/components/Login.jsx (remote auth MFE)
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "host/store"; // <--- correct import (exposed by host)
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, loading, user } = useSelector((state) => state.auth || {});

  // read ?redirect=... param
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/";

  // If already logged-in, go to redirect immediately
  React.useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, redirectTo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // dispatch the thunk exported from host/authSlice
    dispatch(loginUser(form))
      .unwrap()
      .then(() => {
        // on success, go to the requested page
        navigate(redirectTo, { replace: true });
      })
      .catch(() => {
        // thunk will set error in state; optionally show toast
      });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
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
