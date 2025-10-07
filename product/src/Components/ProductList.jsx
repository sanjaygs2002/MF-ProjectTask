import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "host/store";
import { addToCart, updateCartQuantity, removeFromCart } from "host/cartSlice";
import { placeOrderDirect } from "host/orderSlice";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";

function ProductList({ search = "", category = "All", price = 2000 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list = [], status } = useSelector((s) => s.products || {});
  const { user } = useSelector((s) => s.auth);
  const { items: cartItems = [] } = useSelector((s) => s.cart || {});

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    address: user?.address || "",
    phone: user?.phone || "",
    payment: "Cash on Delivery",
  });

  // Fetch products initially
  useEffect(() => {
    if (status === "idle") dispatch(fetchProducts());
  }, [dispatch, status]);

  // ✅ Reusable top-right notification tooltip
  const showNotification = (msg, color = "#007bff") => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 2500);
  };

  // Add to Cart
  const handleAddToCart = (product) => {
    if (!user) return showNotification("⚠️ Please login to add items", "#e63946");
    dispatch(addToCart({ userId: user.id, product: { ...product, quantity: 1 } }));
    showNotification("✅ Product added to cart!");
  };

  // Quantity Change
  const handleQuantityChange = (cartItem, delta) => {
    const newQty = cartItem.quantity + delta;
    if (newQty < 1) {
      dispatch(removeFromCart({ userId: user.id, productId: cartItem.id }));
      showNotification("🗑️ Product removed from cart", "#e63946");
    } else {
      dispatch(updateCartQuantity({ userId: user.id, productId: cartItem.id, quantity: newQty }));
      showNotification("🔄 Cart updated!");
    }
  };

  // Buy Now
  const handleBuyNow = (product) => {
    if (!user) return showNotification("⚠️ Please login to buy", "#e63946");
    setCheckoutProduct({ ...product, quantity: 1 });
    setCheckoutOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name required";
    if (!formData.email) newErrors.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.address.trim()) newErrors.address = "Address required";
    if (!formData.phone) newErrors.phone = "Phone required";
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone must be 10 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Place Order
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) return showNotification("⚠️ Please login", "#e63946");

    const quantity = checkoutProduct.quantity || 1;
    const totalPrice =
      (checkoutProduct.offerPrice || checkoutProduct.originalPrice) * quantity;

    dispatch(
      placeOrderDirect({
        userId: user.id,
        userInfo: formData,
        product: { ...checkoutProduct, quantity, totalPrice },
      })
    );

    setCheckoutOpen(false);
    showNotification("🎉 Order placed successfully!");
  };

  // Filtered product list
  const filteredProducts = list.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || p.category?.toLowerCase() === category.toLowerCase();
    const matchesPrice = !price || p.offerPrice <= price;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const getCartItem = (productId) =>
    cartItems.find((item) => item.id === productId);

  return (
    <div className="product-page">
      {/* ✅ Tooltip notification */}
      {notification && (
        <div
          className="notification-box"
          style={{ background: notification.color }}
        >
          {notification.msg}
        </div>
      )}

      <div className="product-container">
        {filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredProducts.map((p) => {
            const cartItem = getCartItem(p.id);
            return (
              <div
                key={p.id}
                className="product-card"
                onClick={() => navigate(`/products/${p.id}`)}
              >
                <img
                  src={`http://localhost:8083/images/${p.image}`}
                  alt={p.name}
                  className="product-img"
                />
                <h3>{p.name}</h3>
                <p className="price">
                  <span className="old-price">₹{p.originalPrice}</span>{" "}
                  <span className="offer-price">₹{p.offerPrice}</span>
                </p>

                <div
                  className="action-buttons"
                  onClick={(e) => e.stopPropagation()}
                >
                  {cartItem ? (
                    <div className="quantity-selector">
                      <button onClick={() => handleQuantityChange(cartItem, -1)}>-</button>
                      <span>{cartItem.quantity}</span>
                      <button onClick={() => handleQuantityChange(cartItem, 1)}>+</button>
                    </div>
                  ) : (
                    <button
                      className="btn-add-cart"
                      onClick={() => handleAddToCart(p)}
                    >
                      Add to Cart
                    </button>
                  )}

                  <button className="btn-buy" onClick={() => handleBuyNow(p)}>
                    Buy Now
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Checkout Popup */}
      {checkoutOpen && checkoutProduct && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Checkout</h3>
            <form onSubmit={handleSubmit}>
              {["name", "email", "address", "phone"].map((field) => (
                <div key={field}>
                  <input
                    type={field === "email" ? "email" : "text"}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={formData[field]}
                    onChange={(e) => {
                      setFormData({ ...formData, [field]: e.target.value });
                      setErrors({ ...errors, [field]: "" });
                    }}
                  />
                  {errors[field] && <p className="error">{errors[field]}</p>}
                </div>
              ))}

              <select
                value={formData.payment}
                onChange={(e) =>
                  setFormData({ ...formData, payment: e.target.value })
                }
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Online Payment">Online Payment</option>
              </select>

              <h4>
                Total: ₹
                {(checkoutProduct.offerPrice * (checkoutProduct.quantity || 1)).toFixed(2)}
              </h4>

              <button type="submit" className="checkout-btn confirm">
                Place Order
              </button>
              <button
                type="button"
                className="cancel"
                onClick={() => setCheckoutOpen(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
