import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "host/cartSlice";
import { fetchProductById } from "host/productsSlice";
import { placeOrderDirect } from "host/orderSlice";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    address: user?.address || "",
    phone: user?.phone || "",
    payment: "Cash on Delivery",
  });

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  if (!selected) return <p>Loading...</p>;

  const totalPrice = (selected.offerPrice || selected.price) * quantity;

  // ✅ Tooltip Notification Logic (replaces alert)
  const showNotification = (msg, color = "#007bff") => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 2500);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone number must be 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!user) return showNotification("⚠️ Please login first", "#e63946");

    dispatch(
      placeOrderDirect({
        userId: user.id,
        userInfo: formData,
        product: { ...selected, quantity, totalPrice },
      })
    );

    setCheckoutOpen(false);
    showNotification("🎉 Order placed successfully!", "#2ecc71");
  };

  const handleAddToCart = () => {
    if (!user) return showNotification("⚠️ Please login to add items", "#e63946");
    dispatch(addToCart({ userId: user.id, product: { ...selected, quantity } }));
    showNotification("✅ Product added to cart!", "#007bff");
  };

  const handleBuyNow = () => {
    if (!user) return showNotification("⚠️ Please login to buy", "#e63946");
    setCheckoutOpen(true);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < fullStars; i++) stars.push("★");
    if (halfStar) stars.push("☆");
    while (stars.length < 5) stars.push("☆");
    return stars.join(" ");
  };

  const excludedFields = [
    "id",
    "name",
    "image",
    "offerPrice",
    "originalPrice",
    "offers",
    "rating",
    "description",
  ];
  const dynamicFields = Object.entries(selected).filter(
    ([key]) => !excludedFields.includes(key)
  );

  return (
    <div className="product-detail-container">
      {/* ✅ Tooltip Notification */}
      {notification && (
        <div
          className="notification-box"
          style={{ background: notification.color }}
        >
          {notification.msg}
        </div>
      )}

      <div className="image-section">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <img
          src={`http://localhost:8083/images/${selected.image}`}
          alt={selected.name}
          className="product-detail-img"
        />
      </div>

      <div className="info-section">
        <h2 className="product-title">{selected.name}</h2>

        <div className="rating">
          <span className="stars">{renderStars(selected.rating)}</span>
          <span className="rating-value">({selected.rating})</span>
        </div>

        <div className="offers">
          <p>{selected.offers}</p>
        </div>

        <div className="price-section">
          <span className="offer-price">₹{selected.offerPrice}</span>
          <span className="original-price">₹{selected.originalPrice}</span>
        </div>

        <div className="quantity-selector">
          <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>
            -
          </button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>

        <div className="product-description">
          <h3>Description</h3>
          <p>{selected.description}</p>
        </div>

        {dynamicFields.length > 0 && (
          <div className="dynamic-fields">
            <h3>Specifications</h3>
            <table>
              <tbody>
                {dynamicFields.map(([key, value]) => (
                  <tr key={key}>
                    <td style={{ fontWeight: "bold", textTransform: "capitalize" }}>
                      {key.replace(/([A-Z])/g, " $1")}
                    </td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="action-buttons">
          <button className="btn-add-cart" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button className="btn-buy" onClick={handleBuyNow}>
            Buy Now - ₹{totalPrice.toFixed(2)}
          </button>
        </div>
      </div>

      {/* ✅ Checkout Popup */}
      {checkoutOpen && (
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

export default ProductDetail;
