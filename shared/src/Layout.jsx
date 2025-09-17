import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Layout({ children }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  return (
    <div>
      <Navbar onSearch={setSearch} onFilter={setCategory} />
      <main style={{ minHeight: "80vh", padding: "1rem" }}>
        {typeof children === "function" ? children({ search, category }) : children}
      </main>
      <Footer />
    </div>
  );
}
