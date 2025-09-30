// host/src/components/ProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // const { user } = useSelector((s) => s.auth || {});
  // console.log(user);
  
  const user = useSelector((s) => {
  console.log("S denotes",s);         // logs entire Redux state
  console.log(s.auth);    // logs auth slice
  return s.auth?.user;    // safely return user
});

 
  
  const location = useLocation();

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return children;
}
