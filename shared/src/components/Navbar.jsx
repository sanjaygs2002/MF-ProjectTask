import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "host/authSlice"; // adjust path if different
import "../styles/navbar.css";

export default function Navbar() {
  const { user } = useSelector((s) => s.auth || {});
  const dispatch = useDispatch();

  return (
    <nav className="navbar">
     
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">E-Commerce</Link>
      </div>

    
      <div className="navbar-right">
        {!user ? (
          <Link to="/login" className="btn-signup">Sign In</Link>
        ) : (
          <>
            <Link to="/cart" className="btn-link">Cart</Link>
            <Link to="/orders" className="btn-link">Order History</Link>

          
            <div className="user-info">
              <span className="user-icon">👤</span>
              <div className="user-details">
                <span className="username">{user.username}</span>
                <small className="email">{user.email}</small>
              </div>
            </div>

            <button
              onClick={() => dispatch(logout())}
              className="btn-logout"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
