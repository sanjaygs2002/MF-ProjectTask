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
  const hideFooter = location.pathname === "/login" || location.pathname === "/signup";

  // Scroll to top function
const scrollToTop = () => {
  if (mainRef.current) {
    // If scrolling is inside main container
    mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // If scrolling is on the window
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};


  useEffect(() => {
    if (!isHomePage) return; // Only home page

   

 const scrollContainer = mainRef.current;

const handleScroll = () => {
  const scrollTop = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;

  setShowScrollBtn(scrollTop + clientHeight >= scrollHeight / 2);
};
scrollContainer.addEventListener("scroll", handleScroll);

    handleScroll(); // trigger on load

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  return (
    <div className="layout-container">
      <Navbar onSearch={onSearch} onFilter={onFilter} onPriceChange={onPriceChange} />

      <main className="layout-main" ref={mainRef}>
        {children}
      </main>

      {!hideFooter && <Footer />}

      {/* Scroll-to-top button */}
      {isHomePage && (
        <button
          className={`scroll-top-btn ${showScrollBtn ? "visible" : ""}`}
          onClick={scrollToTop}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
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
