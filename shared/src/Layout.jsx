import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./Layout.css"; // optional external CSS

export default function Layout({ children }) {
  return (
    <div className="layout-container">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="layout-content">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
