import React, { Suspense, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store } from "./redux/store";
import Layout from "shared/Layout";
import ProtectedRoute from "./ProtectedRoute";
import TagManager from "react-gtm-module";

const AuthLogin = React.lazy(() => import("auth/Login"));
const AuthSignup = React.lazy(() => import("auth/Signup"));
const ProductList = React.lazy(() => import("product/ProductList"));
const ProductDetail = React.lazy(() => import("product/ProductDetail"));
const CartPage = React.lazy(() => import("cart/CartPage"));
const OrderHistory = React.lazy(() => import("orders/OrderHistory"));
const EditProfile = React.lazy(() => import("auth/EditProfile"));

const tagManagerArgs = {
  gtmId: "GTM-TKQNSNFJ",
};

// Initialize GTM once
TagManager.initialize(tagManagerArgs);

// ✅ Track page views on route change
const TrackPageView = () => {
  const location = useLocation();

  useEffect(() => {
    TagManager.dataLayer({
      dataLayer: {
        event: "pageview",
        page_path: location.pathname + location.search,
      },
    });
    console.log("📊 GTM Page View:", location.pathname);
  }, [location]);

  return null;
};

function AppWrapper() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState(2000);

  return (
    <BrowserRouter>
      {/* Track page view must be inside BrowserRouter */}
      <TrackPageView />
      <Layout
        onSearch={setSearch}
        onFilter={setCategory}
        onPriceChange={setPrice}
      >
        <App search={search} category={category} price={price} />
      </Layout>
    </BrowserRouter>
  );
}

function App({ search, category, price }) {
  const user = useSelector((state) => state.auth.user);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<AuthLogin />} />
        <Route path="/signup" element={<AuthSignup />} />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProductList search={search} category={category} price={price} />
          }
        />
        <Route path="/products/:id" element={<ProductDetail />} />
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
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
  <Provider store={store}>
    <AppWrapper />
  </Provider>
);
