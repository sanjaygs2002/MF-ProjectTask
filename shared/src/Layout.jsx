import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Layout({ children, onSearch, onFilter, onPriceChange }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState(2000);

  // Whenever local state changes, propagate to parent via callbacks if provided
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

  return (
    <div>
      <Navbar
        onSearch={handleSearch}
        onFilter={handleFilter}
        onPriceChange={handlePriceChange}
      />
      <main style={{ minHeight: "80vh", padding: "1rem" }}>
        {typeof children === "function"
          ? children({ search, category, price })
          : children}
      </main>
      <Footer />
    </div>
  );
}
