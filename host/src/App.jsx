import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Layout from "shared/Layout";
import ProtectedRoute from "./ProtectedRoute";

const AuthLogin = React.lazy(() => import("auth/Login"));
const AuthSignup = React.lazy(() => import("auth/Signup"));
const ProductList = React.lazy(() => import("product/ProductList"));
const ProductDetail = React.lazy(() => import("product/ProductDetail"));
const CartPage = React.lazy(() => import("cart/CartPage"));

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Layout>
          {({ search, category }) => (
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/login" element={<AuthLogin />} />
                <Route path="/signup" element={<AuthSignup />} />

                {/* ProductList receives search/category */}
                <Route path="/" element={<ProductList search={search} category={category} />} />

                <Route
                  path="/products/:id"
                  element={
                    <ProtectedRoute>
                      <ProductDetail />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          )}
        </Layout>
      </BrowserRouter>
    </Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
