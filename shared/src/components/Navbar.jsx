import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">E-Commerce</Link>
      </div>
    
      <div className="navbar-right">
        <Link to="/login" className="btn-signup">Sign in</Link>
        
         {/* <Link to="/signup" className="btn-signup">Sign Up</Link> */}
      </div>
    </nav>
  );
}
