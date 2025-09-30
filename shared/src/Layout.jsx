import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./Layout.css";

export default function Layout({ children, onSearch, onFilter, onPriceChange }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState(2000);
  const location = useLocation();

  const handleSearch = (val) => {
    setSearch(val);
    onSearch && onSearch(val);
  };

  const handleFilter = (val) => {
    setCategory(val);
    onFilter && onFilter(val);
  };

  const handlePriceChange = (val) => {
    setPrice(val);
    onPriceChange && onPriceChange(val);
  };

  // Check if page is login or signup
  const hideFooter = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="layout-container">
      <Navbar
        onSearch={handleSearch}
        onFilter={handleFilter}
        onPriceChange={handlePriceChange}
      />
      <main className="layout-main">
        {typeof children === "function"
          ? children({ search, category, price })
          : children}
      </main>

      {/* Footer only shows if not login/signup */}
      {!hideFooter && <Footer />}
    </div>
  );
}
