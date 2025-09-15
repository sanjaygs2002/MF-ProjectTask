// Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "host/store"; // adjust path to your exposed store
import "../styles/navbar.css";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">E-Commerce</Link>
      </div>

      <div className="navbar-right">
        {!user ? (
          <Link to="/login" className="btn-signup">Sign in</Link>
        ) : (
          <div className="user-info">
            <span className="user-icon">👤</span>
            <div className="user-details">
              <p>{user.username}</p>
              <p className="email">{user.email}</p>
              <button
                className="logout-btn"
                onClick={() => dispatch(logout())}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
