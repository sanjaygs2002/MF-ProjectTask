import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import {Provider} from  "react-redux";
import { store } from "./redux/store";
// Shared layout from another MFE
import Layout from "shared/Layout";
import ProtectedRoute from "./ProtectedRoute";

// Lazy-loaded remote components
const AuthLogin = React.lazy(() => import("auth/Login"));
const AuthSignup = React.lazy(() => import("auth/Signup"));
const ProductList = React.lazy(() => import("product/ProductList"));
const ProductDetail = React.lazy(() => import("product/ProductDetail"));


function App() {
  return (
    
      <Layout>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Auth Routes */}

            <Route path="/login" element={<AuthLogin />} />
            <Route path="/signup" element={<AuthSignup />} />

            {/* Product Routes */}
             
            <Route path="/" element={<ProductList />} />
                          <Route path="/products/:id"element={
                    <ProtectedRoute>
                      <ProductDetail />
                    </ProtectedRoute>
                  }
                />

          </Routes>
        </Suspense>
      </Layout>
   
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
