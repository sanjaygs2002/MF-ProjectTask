import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "host/authSlice";
import { ShoppingCart, Package } from "lucide-react"; // icons
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
  const [price, setPrice] = useState(2000);
  const dropdownRef = useRef(null);
  let closeTimeout;

  const isProductPage =
    location.pathname === "/" || location.pathname === "/products";

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(closeTimeout);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => setDropdownOpen(false), 250);
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
        <Link to="/" className="navbar-brand">
          🛒 E-Commerce
        </Link>
      </div>

      {/* Right: search + filter + user/cart/orders */}
      <div className="navbar-right">
        {isProductPage && (
          <div className="navbar-filters">
            <input
              type="text"
              className="search-input"
              placeholder="Search products...              🔍"
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
            <select
              className="filter-select"
              onChange={(e) => onFilter && onFilter(e.target.value)}
            >
              <option value="All">Filter by Category</option>
              <option value="Home Appliances">Home</option>
              <option value="Accessories">Accessories</option>
              <option value="Footwear">Footwear</option>
              <option value="Clothing">Clothing</option>
              <option value="Electronics">Electronics</option>
              <option value="Watches">Watches</option>
            </select>
            <div className="price-slider">
              <label>₹ {price}</label>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={price}
                onChange={handlePriceChange}
              />
            </div>
          </div>
        )}

        {!user ? (
          <Link to="/login" className="btn-signup">
            Sign In
          </Link>
        ) : (
          <>
            {/* Cart Icon with hover message */}
            <div
              className="icon-btn"
              onMouseEnter={() => setCartHover(true)}
              onMouseLeave={() => setCartHover(false)}
            >
              <Link to="/cart">
                <ShoppingCart size={22} />
                {cartItems.length > 0 && (
                  <span className="badge">{cartItems.length}</span>
                )}
              </Link>
              {cartHover && <div className="hover-message">Your Cart</div>}
            </div>

            {/* Orders Icon with hover message */}
            <div
              className="icon-btn"
              onMouseEnter={() => setOrdersHover(true)}
              onMouseLeave={() => setOrdersHover(false)}
            >
              <Link to="/orders">
                <Package size={22} />
                {orders.length > 0 && (
                  <span className="badge">{orders.length}</span>
                )}
              </Link>
              {ordersHover && <div className="hover-message">Your Orders</div>}
            </div>

            {/* User dropdown */}
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
                    onClick={() => navigate("/edit-profile")}
                  >
                    <span className="username">{user.username}</span>
                    <br />
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

