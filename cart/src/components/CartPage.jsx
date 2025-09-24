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

  // ✅ Track selected items for checkout
  const [selectedItems, setSelectedItems] = useState([]);

  // ✅ Toast Notification
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, user]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleQuantityChange = (productId, quantity) => {
    if (user) {
      dispatch(updateCartQuantity({ userId: user.id, productId, quantity }));
      showNotification("Cart updated successfully!");
    }
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

  const handleItemSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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

      {/* ✅ Notification Toast */}
      {notification && <div className="notification-box">{notification}</div>}

      {items.length === 0 ? (
        <p className="cart-msg">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                {/* ✅ Select checkbox */}
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
                        handleQuantityChange(
                          item.id,
                          item.quantity - 1 < 1 ? 1 : item.quantity - 1
                        )
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
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
              <select
                value={formData.payment}
                onChange={(e) =>
                  setFormData({ ...formData, payment: e.target.value })
                }
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Online Payment">Online Payment</option>
              </select>

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
