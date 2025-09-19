import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store } from "./redux/store";
import Layout from "shared/Layout";
import ProtectedRoute from "./ProtectedRoute";

const AuthLogin = React.lazy(() => import("auth/Login"));
const AuthSignup = React.lazy(() => import("auth/Signup"));
const ProductList = React.lazy(() => import("product/ProductList"));
const ProductDetail = React.lazy(() => import("product/ProductDetail"));
const CartPage = React.lazy(() => import("cart/CartPage"));
const OrderHistory = React.lazy(() => import("orders/OrderHistory"));

function App() {
  const user = useSelector((state) => state.auth.user);

  return (
    
    <BrowserRouter>
      <Layout>
        {({ search, category }) => (
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<AuthLogin />} />
              <Route path="/signup" element={<AuthSignup />} />

              <Route
                path="/"
                element={<ProductList search={search} category={category} />}
              />

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

              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    {user && user.id ? (
                      <OrderHistory userId={user.id} />
                    ) : (
                      <p style={{ padding: "20px" }}>
                        ⚠ Please login to view your orders
                      </p>
                    )}
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        )}
      </Layout>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
