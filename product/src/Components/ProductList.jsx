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
  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    address: user?.address || "",
    phone: user?.phone || "",
    payment: "Cash on Delivery",
  });
  const [errors, setErrors] = useState({});

  // Fetch products
  useEffect(() => {
    if (status === "idle") dispatch(fetchProducts());
  }, [dispatch, status]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToCart = (product) => {
    if (!user) return alert("Please login to add items to cart");
    dispatch(addToCart({ userId: user.id, product: { ...product, quantity: 1 } }));
    showNotification("✅ Product added to cart!");
  };

  const handleQuantityChange = (cartItem, delta) => {
    const newQty = cartItem.quantity + delta;

    if (newQty < 1) {
      dispatch(removeFromCart({ userId: user.id, productId: cartItem.id }));
      showNotification("🗑️ Product removed from cart");
    } else {
      dispatch(updateCartQuantity({ userId: user.id, productId: cartItem.id, quantity: newQty }));
    }
  };

  const handleBuyNow = (product) => {
    if (!user) return alert("Please login to buy");
    setCheckoutProduct({ ...product, quantity: 1 }); // Always 1 for Buy Now
    setCheckoutOpen(true);
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) return alert("Please login");

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
      {notification && <div className="notification-box">{notification}</div>}

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
                      <button onClick={() => handleQuantityChange(cartItem, -1)}>
                        -
                      </button>
                      <span>{cartItem.quantity}</span>
                      <button onClick={() => handleQuantityChange(cartItem, 1)}>
                        +
                      </button>
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
                     {/* - ₹{p.offerPrice.toFixed(2)} */}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Checkout Form */}
      {checkoutOpen && checkoutProduct && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Checkout</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors({ ...errors, name: "" });
                }}
              />
              {errors.name && <p className="error">{errors.name}</p>}

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors({ ...errors, email: "" });
                }}
              />
              {errors.email && <p className="error">{errors.email}</p>}

              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  setErrors({ ...errors, address: "" });
                }}
              />
              {errors.address && <p className="error">{errors.address}</p>}

              <input
                type="text"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  setErrors({ ...errors, phone: "" });
                }}
              />
              {errors.phone && <p className="error">{errors.phone}</p>}

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
