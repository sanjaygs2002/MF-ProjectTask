import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "host/authSlice";
import { ShoppingCart, Package } from "lucide-react";
import {
  BRAND_NAME,
  PRICE_MIN,
  PRICE_MAX,
  PRICE_STEP,
  PRICE_DEFAULT,
  CATEGORY_OPTIONS,
  HOVER_CART,
  HOVER_ORDERS,
  ROUTES,
  SEARCH_PLACEHOLDER,
  DROPDOWN_CLOSE_DELAY,
  ICON_SIZE,
} from "../constants/NavBarConst"; // ✅ import constants
import "../styles/navbar.css";

export default function Navbar({ onSearch, onFilter, onPriceChange }) {
  const user = useSelector((s) => s.auth?.user);
  const cartItems = useSelector((s) => s.cart?.items || []);
  const orders = useSelector((s) => s.orders?.list || []);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const [ordersHover, setOrdersHover] = useState(false);
  const [price, setPrice] = useState(PRICE_DEFAULT);
  const dropdownRef = useRef(null);
  let closeTimeout;

  const isProductPage =
    location.pathname === ROUTES.HOME || location.pathname === ROUTES.PRODUCTS;

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
    closeTimeout = setTimeout(
      () => setDropdownOpen(false),
      DROPDOWN_CLOSE_DELAY
    );
  };

  const handlePriceChange = (e) => {
    const val = Number(e.target.value);
    setPrice(val);
    if (onPriceChange) onPriceChange(val);
  };

  return (
    <nav className="navbar">
      {/* Left: Brand */}
      <div className="navbar-left">
        <Link to={ROUTES.HOME} className="navbar-brand">
          {BRAND_NAME}
        </Link>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        {isProductPage && (
          <div className="navbar-filters">
            <input
              type="text"
              className="search-input"
              placeholder={SEARCH_PLACEHOLDER}
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />

            <select
              className="filter-select"
              onChange={(e) => onFilter && onFilter(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="price-slider">
              <label>₹ {price}</label>
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={price}
                onChange={handlePriceChange}
              />
            </div>
          </div>
        )}

        {!user ? (
          <Link to={ROUTES.LOGIN} className="btn-signup">
            Sign In
          </Link>
        ) : (
          <>
            {/* Cart Icon */}
            <div
              className="icon-btn"
              onMouseEnter={() => setCartHover(true)}
              onMouseLeave={() => setCartHover(false)}
            >
              <Link to={ROUTES.CART}>
                <ShoppingCart size={ICON_SIZE} />
                {cartItems.length > 0 && (
                  <span className="badge">{cartItems.length}</span>
                )}
              </Link>
              {cartHover && <div className="hover-message">{HOVER_CART}</div>}
            </div>

            {/* Orders Icon */}
            <div
              className="icon-btn"
              onMouseEnter={() => setOrdersHover(true)}
              onMouseLeave={() => setOrdersHover(false)}
            >
              <Link to={ROUTES.ORDERS}>
                <Package size={ICON_SIZE} />
                {orders.length > 0 && (
                  <span className="badge">{orders.length}</span>
                )}
              </Link>
              {ordersHover && (
                <div className="hover-message">{HOVER_ORDERS}</div>
              )}
            </div>

            {/* User Dropdown */}
            <div
              className="user-dropdown"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className="user-icon">👤</span>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div
                    className="user-details clickable"
                    onClick={() => navigate(ROUTES.EDIT_PROFILE)}
                  >
                    <span className="username">{user.username}</span>
                    <br />
                    <small className="email">{user.email}</small>
                  </div>

                  <button
                    onClick={() => {
                      dispatch(logout());
                      navigate(ROUTES.HOME);
                    }}
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
