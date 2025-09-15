// host/src/components/ProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Option 1: redirect with state
    // return (
    //   <Navigate
    //     to="/login"
    //     state={{ from: location, message: "Please login to continue" }}
    //     replace
    //   />
    // );

    // Option 2: or just render a message instead of redirect
    return <div style={{textAlign:"center", marginTop:"2rem"}}>⚠️ Please login to continue.</div>;
  }

  return children;
}
