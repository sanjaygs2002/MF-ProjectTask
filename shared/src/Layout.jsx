import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./Layout.css";

export default function Layout({ children, onSearch, onFilter, onPriceChange }) {
  const location = useLocation();
  const mainRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const isHomePage = location.pathname === "/";
  const hideFooter =
    location.pathname === "/login" || location.pathname === "/signup";

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        setShowScrollBtn(mainRef.current.scrollTop > 200);
      }
    };

    const scrollContainer = mainRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="layout-container">
      <Navbar
        onSearch={onSearch}
        onFilter={onFilter}
        onPriceChange={onPriceChange}
      />

      <main className="layout-main" ref={mainRef}>
        {children}
      </main>

      {!hideFooter && <Footer />}

      {isHomePage && showScrollBtn && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="arrow-icon"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
