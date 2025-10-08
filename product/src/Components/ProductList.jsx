import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "host/store";
import { addToCart, updateCartQuantity, removeFromCart } from "host/cartSlice";
import { placeOrderDirect } from "host/orderSlice";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";

// ✅ Import constants
import {
  IMAGE_BASE_URL,
  NOTIFICATION_TIMEOUT,
  DEFAULT_CATEGORY,
  DEFAULT_PRICE,
  PAYMENT_METHODS,
  PRODUCT_MESSAGES,
  VALIDATION_MESSAGES,
  COLORS,
} from "../Constant/ProdListConst";

function ProductList({ search = "", category = DEFAULT_CATEGORY, price = DEFAULT_PRICE }) {
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
    payment: PAYMENT_METHODS.COD,
  });

  // Fetch products initially
  useEffect(() => {
    if (status === "idle") dispatch(fetchProducts());
  }, [dispatch, status]);

  // ✅ Top-right tooltip notification
  const showNotification = (msg, color = COLORS.PRIMARY) => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), NOTIFICATION_TIMEOUT);
  };

  // ✅ Add to Cart
  const handleAddToCart = (product) => {
    if (!user) return showNotification(PRODUCT_MESSAGES.LOGIN_TO_ADD, COLORS.ERROR);

    dispatch(addToCart({ userId: user.id, product: { ...product, quantity: 1 } }));
    showNotification(PRODUCT_MESSAGES.PRODUCT_ADDED);
  };

  // ✅ Quantity Change
  const handleQuantityChange = (cartItem, delta) => {
    const newQty = cartItem.quantity + delta;
    if (newQty < 1) {
      dispatch(removeFromCart({ userId: user.id, productId: cartItem.id }));
      showNotification(PRODUCT_MESSAGES.PRODUCT_REMOVED, COLORS.ERROR);
    } else {
      dispatch(updateCartQuantity({ userId: user.id, productId: cartItem.id, quantity: newQty }));
      showNotification(PRODUCT_MESSAGES.CART_UPDATED);
    }
  };

  // ✅ Buy Now
  const handleBuyNow = (product) => {
    if (!user) return showNotification(PRODUCT_MESSAGES.LOGIN_TO_BUY, COLORS.ERROR);

    setCheckoutProduct({ ...product, quantity: 1 });
    setCheckoutOpen(true);
  };

  // ✅ Validation
  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = VALIDATION_MESSAGES.NAME_REQUIRED;
    if (!formData.email) newErrors.email = VALIDATION_MESSAGES.EMAIL_REQUIRED;
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
    if (!formData.address.trim()) newErrors.address = VALIDATION_MESSAGES.ADDRESS_REQUIRED;
    if (!formData.phone) newErrors.phone = VALIDATION_MESSAGES.PHONE_REQUIRED;
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = VALIDATION_MESSAGES.PHONE_INVALID;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Place Order
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!user) return showNotification(PRODUCT_MESSAGES.LOGIN_REQUIRED, COLORS.ERROR);

    const quantity = checkoutProduct.quantity || 1;
    const totalPrice = (checkoutProduct.offerPrice || checkoutProduct.originalPrice) * quantity;

    dispatch(
      placeOrderDirect({
        userId: user.id,
        userInfo: formData,
        product: { ...checkoutProduct, quantity, totalPrice },
      })
    );

    setCheckoutOpen(false);
    showNotification(PRODUCT_MESSAGES.ORDER_SUCCESS);
  };

  // ✅ Filtered product list
  const filteredProducts = list.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === DEFAULT_CATEGORY || p.category?.toLowerCase() === category.toLowerCase();
    const matchesPrice = !price || p.offerPrice <= price;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const getCartItem = (productId) => cartItems.find((item) => item.id === productId);

  return (
    <div className="product-page">
      {/* ✅ Tooltip Notification */}
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
          <p>{PRODUCT_MESSAGES.NO_PRODUCTS}</p>
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
                  src={`${IMAGE_BASE_URL}${p.image}`}
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

      {/* ✅ Checkout Popup */}
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
                onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
              >
                <option value={PAYMENT_METHODS.COD}>{PAYMENT_METHODS.COD}</option>
                <option value={PAYMENT_METHODS.ONLINE}>{PAYMENT_METHODS.ONLINE}</option>
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
