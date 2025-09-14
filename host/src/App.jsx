import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

// Shared layout from another MFE
import Layout from "shared/Layout";

// Lazy-loaded remote components
const AuthLogin = React.lazy(() => import("auth/Login"));
const AuthSignup = React.lazy(() => import("auth/Signup"));
const ProductList = React.lazy(() => import("product/ProductList"));
const ProductDetail = React.lazy(() => import("product/ProductDetail"));

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<AuthLogin />} />
            <Route path="/signup" element={<AuthSignup />} />

            {/* Product Routes */}
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
