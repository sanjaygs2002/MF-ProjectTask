import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/footer.css";
 
export default function Footer() {
  const location = useLocation();
 
  const scrollToTop = () => {
    document.documentElement.scrollTop = 0; // Chrome, Firefox, IE, Opera
    document.body.scrollTop = 0; // Safari
  };
 
  return (
    <footer className="footer">
      {/* Show Back to Top button only on home page */}
      {location.pathname === "/" && (
        <div className="footer-top-button" onClick={scrollToTop}>
          ↑
        </div>
      )}
 
      <div className="footer-sections">
        <div>
          <h4>Get to Know Us</h4>
          <p>About Amazon</p>
          <p>Careers</p>
          <p>Press Releases</p>
          <p>Amazon Science</p>
        </div>
 
        <div>
          <h4>Connect with Us</h4>
          <p>Facebook</p>
          <p>Twitter</p>
          <p>Instagram</p>
        </div>
 
        <div>
          <h4>Make Money with Us</h4>
          <p>Sell on Amazon</p>
          <p>Sell under Amazon Accelerator</p>
          <p>Protect and Build Your Brand</p>
          <p>Amazon Global Selling</p>
          <p>Supply to Amazon</p>
          <p>Become an Affiliate</p>
          <p>Fulfilment by Amazon</p>
          <p>Advertise Your Products</p>
          <p>Amazon Pay on Merchants</p>
        </div>
 
        <div>
          <h4>Let Us Help You</h4>
          <p>Your Account</p>
          <p>Returns Centre</p>
          <p>Recalls and Product Safety Alerts</p>
          <p>100% Purchase Protection</p>
          <p>Amazon App Download</p>
          <p>Help</p>
        </div>
      </div>
    </footer>
  );
}
 