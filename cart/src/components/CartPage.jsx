// src/components/CartPage.jsx
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
    payment: "Cash on Delivery",
  });

  //  Track selected items
  const [selectedItems, setSelectedItems] = useState([]);

  //  Toast Notification
  const [notification, setNotification] = useState(null);

  // Form Validation
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Update selectedItems if cart changes (default all selected)
    setSelectedItems(items.map((item) => item.id));
  }, [items]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRemove = (productId) => {
    if (user) {
      dispatch(removeFromCart({ userId: user.id, productId }));
      showNotification("Item removed from cart!");
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      showNotification("⚠️ Please select at least one item to proceed.");
      return;
    }
    dispatch(openCheckout());
  };

  //  Individual selection
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
      if (!value.trim()) return "Name is required.";
      break;
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Invalid email format.";
      break;
    case "address":
      if (!value.trim()) return "Address is required.";
      break;
    case "phone":
      if (!/^[0-9]{10}$/.test(value))
        return "Phone number must be 10 digits.";
      break;
    case "payment":
      if (!value.trim()) return "Select a payment method.";
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
        showNotification("Item removed from cart!");
      } else {
        dispatch(updateCartQuantity({ userId: user.id, productId, quantity }));
        showNotification("Cart updated successfully!");
      }
    }
  };

  //  Select All
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(items.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });

  // live validation
  setErrors({ ...errors, [name]: validateField(name, value) });
};

const handleSubmit = (e) => {
  e.preventDefault();

  // validate all fields before submit
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

    // remove placed items
    orderItems.forEach((item) =>
      dispatch(removeFromCart({ userId: user.id, productId: item.id }))
    );

    showNotification("✅ Order placed successfully!");
    dispatch(closeCheckout());
    setSelectedItems([]);
  }
};

  const total = items
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => {
      const price = Number(item.offerPrice) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>

      {notification && <div className="notification-box">{notification}</div>}

      {items.length === 0 ? (
        <p className="cart-msg">Your cart is empty.</p>
      ) : (
        <>
        
          <div className="select-all-container">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              className="select-checkbox"
            />
            <label>Select All</label>
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
                  src={`http://localhost:8083/images/${item.image}`}
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
            <h3>Total: ₹{total.toFixed(2)}</h3>
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}

      {checkoutOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Checkout</h3>
            <form onSubmit={handleSubmit}>
  <input
    type="text"
    name="name"
    placeholder="Name"
    value={formData.name}
    onChange={handleChange}
  />
  {errors.name && <span className="field-error">{errors.name}</span>}

  <input
    type="email"
    name="email"
    placeholder="Email"
    value={formData.email}
    onChange={handleChange}
  />
  {errors.email && <span className="field-error">{errors.email}</span>}

  <input
    type="text"
    name="address"
    placeholder="Address"
    value={formData.address}
    onChange={handleChange}
  />
  {errors.address && <span className="field-error">{errors.address}</span>}

  <input
    type="text"
    name="phone"
    placeholder="Phone"
    value={formData.phone}
    onChange={handleChange}
  />
  {errors.phone && <span className="field-error">{errors.phone}</span>}

  <select
    name="payment"
    value={formData.payment}
    onChange={handleChange}
  >
    <option value="">-- Select Payment Method --</option>
    <option value="Cash on Delivery">Cash on Delivery</option>
    <option value="Online Payment">Online Payment</option>
  </select>
  {errors.payment && <span className="field-error">{errors.payment}</span>}

  <h4 className="checkout-total">Total: ₹{total.toFixed(2)}</h4>
  <button type="submit" className="checkout-btn confirm">
    Place Order
  </button>
  <button
    type="button"
    className="cancel"
    onClick={() => dispatch(closeCheckout())}
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

export default CartPage;
