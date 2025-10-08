import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  openCheckout,
  closeCheckout,
  placeOrder,
} from "host/cartSlice";

import {
  CART_MESSAGES,
  PAYMENT_METHODS,
  VALIDATION_MESSAGES,
  NOTIFICATION_TIMEOUT,
  IMAGE_BASE_URL,
  CART_TITLE,
  CHECKOUT_TITLE,
  SELECT_ALL_LABEL,
  CART_TOTAL_LABEL,
  CART_PLACE_ORDER_BTN,
  CART_CANCEL_BTN,
  CART_PROCEED_BTN,
} from "../Constant/CartPageConst";

import "./CartPage.css";

function CartPage() {
  const dispatch = useDispatch();
  const { items, checkoutOpen } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    address: user?.address || "",
    phone: user?.phone || "",
    payment: PAYMENT_METHODS.COD,
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) dispatch(fetchCart(user.id));
  }, [dispatch, user]);

  useEffect(() => {
    setSelectedItems(items.map((item) => item.id));
  }, [items]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), NOTIFICATION_TIMEOUT);
  };

  const handleRemove = (productId) => {
    if (user) {
      dispatch(removeFromCart({ userId: user.id, productId }));
      showNotification(CART_MESSAGES.ITEM_REMOVED);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      showNotification(CART_MESSAGES.SELECT_ITEM_WARNING);
      return;
    }
    dispatch(openCheckout());
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return VALIDATION_MESSAGES.NAME_REQUIRED;
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return VALIDATION_MESSAGES.EMAIL_INVALID;
        break;
      case "address":
        if (!value.trim()) return VALIDATION_MESSAGES.ADDRESS_REQUIRED;
        break;
      case "phone":
        if (!/^[0-9]{10}$/.test(value))
          return VALIDATION_MESSAGES.PHONE_INVALID;
        break;
      case "payment":
        if (!value.trim()) return VALIDATION_MESSAGES.PAYMENT_REQUIRED;
        break;
      default:
        return "";
    }
    return "";
  };

  const handleQuantityChange = (productId, quantity) => {
    if (user) {
      if (quantity < 1) {
        dispatch(removeFromCart({ userId: user.id, productId }));
        showNotification(CART_MESSAGES.ITEM_REMOVED);
      } else {
        dispatch(updateCartQuantity({ userId: user.id, productId, quantity }));
        showNotification(CART_MESSAGES.CART_UPDATED);
      }
    }
  };

  const handleSelectAll = (e) => {
    setSelectedItems(e.target.checked ? items.map((i) => i.id) : []);
  };

  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const msg = validateField(key, formData[key]);
      if (msg) newErrors[key] = msg;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (user) {
      const orderItems = items.filter((item) =>
        selectedItems.includes(item.id)
      );

      dispatch(
        placeOrder({
          userId: user.id,
          userInfo: formData,
          items: orderItems,
        })
      );

      orderItems.forEach((item) =>
        dispatch(removeFromCart({ userId: user.id, productId: item.id }))
      );

      showNotification(CART_MESSAGES.ORDER_SUCCESS);
      dispatch(closeCheckout());
      setSelectedItems([]);
    }
  };

  const total = items
    .filter((item) => selectedItems.includes(item.id))
    .reduce(
      (sum, item) => sum + (Number(item.offerPrice) || 0) * (item.quantity || 1),
      0
    );

  return (
    <div className="cart-container">
      <h2 className="cart-title">{CART_TITLE}</h2>

      {notification && <div className="notification-box">{notification}</div>}

      {items.length === 0 ? (
        <p className="cart-msg">{CART_MESSAGES.CART_EMPTY}</p>
      ) : (
        <>
          <div className="select-all-container">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              className="select-checkbox"
            />
            <label>{SELECT_ALL_LABEL}</label>
          </div>

          <div className="cart-list">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleItemSelect(item.id)}
                  className="select-checkbox"
                />

                <img
                  src={`${IMAGE_BASE_URL}${item.image}`}
                  alt={item.name}
                  className="cart-img"
                />

                <div className="cart-info">
                  <h4>{item.name}</h4>
                  <p className="price">₹{item.offerPrice}</p>
                </div>

                <div className="cart-controls">
                  <div className="quantity-control">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>
              {CART_TOTAL_LABEL}: ₹{total.toFixed(2)}
            </h3>
            <button className="checkout-btn" onClick={handleCheckout}>
              {CART_PROCEED_BTN}
            </button>
          </div>
        </>
      )}

      {checkoutOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>{CHECKOUT_TITLE}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <span className="field-error">{errors.name}</span>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />
              {errors.address && (
                <span className="field-error">{errors.address}</span>
              )}

              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <span className="field-error">{errors.phone}</span>
              )}

              <select
                name="payment"
                value={formData.payment}
                onChange={handleChange}
              >
                <option value="">-- Select Payment Method --</option>
                <option value={PAYMENT_METHODS.COD}>
                  {PAYMENT_METHODS.COD}
                </option>
                <option value={PAYMENT_METHODS.ONLINE}>
                  {PAYMENT_METHODS.ONLINE}
                </option>
              </select>
              {errors.payment && (
                <span className="field-error">{errors.payment}</span>
              )}

              <h4 className="checkout-total">
                {CART_TOTAL_LABEL}: ₹{total.toFixed(2)}
              </h4>

              <button type="submit" className="checkout-btn confirm">
                {CART_PLACE_ORDER_BTN}
              </button>
              <button
                type="button"
                className="cancel"
                onClick={() => dispatch(closeCheckout())}
              >
                {CART_CANCEL_BTN}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
