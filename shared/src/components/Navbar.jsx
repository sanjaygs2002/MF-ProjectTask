import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "host/authSlice"; 
import "../styles/navbar.css";

export default function Navbar({ onSearch, onFilter }) {
  const user = useSelector((s) => s.auth?.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  let closeTimeout;

  const isProductPage =
    location.pathname === "/" || location.pathname.startsWith("/products");

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(closeTimeout);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => setDropdownOpen(false), 250); // delay
  };

  return (
    <nav className="navbar">
      {/* Left side */}
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          E-Commerce
        </Link>
      </div>

      {/* Middle section (search + filter) */}
      {isProductPage && (
        <div className="navbar-center">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search products..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
          <select
            className="filter-select"
            onChange={(e) => onFilter && onFilter(e.target.value)}
          >
            <option value="All">Filter by Gender</option>
            <option value="Unisex">Unisex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      )}

      {/* Right side */}
      <div className="navbar-right">
        {!user ? (
          <Link to="/login" className="btn-signup">
            Sign In
          </Link>
        ) : (
          <>
            <Link to="/cart" className="btn-link">Cart</Link>
            <Link to="/orders" className="btn-link">Order History</Link>

            {/* 👤 User Icon with Dropdown */}
            <div
              className="user-dropdown"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <span className="user-icon">👤</span>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="user-details">
                    <span className="username">{user.username}</span>
                    <small className="email">{user.email}</small>
                  </div>
                  <button
                    onClick={() => dispatch(logout())}
                    className="btn-logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
