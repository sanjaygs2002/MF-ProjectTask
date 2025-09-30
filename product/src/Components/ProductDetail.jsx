// ProductDetail.jsx
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

const validateForm = () => {
  let newErrors = {};

  if (!formData.name.trim()) {
    newErrors.name = "Name is required";
  }
  if (!formData.email) {
    newErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "Invalid email format";
  }
  if (!formData.address.trim()) {
    newErrors.address = "Address is required";
  }
  if (!formData.phone) {
    newErrors.phone = "Phone is required";
  } else if (!/^\d{10}$/.test(formData.phone)) {
    newErrors.phone = "Phone number must be 10 digits";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateForm()) return; // stop if errors exist

  if (!user) return alert("Please login first");

  dispatch(
    placeOrderDirect({
      userId: user.id,
      userInfo: formData,
      product: { ...selected, quantity, totalPrice },
    })
  );

  setCheckoutOpen(false);
  showNotification("🎉 Order placed successfully!");
};

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000); // hide after 3s
  };

  const handleAddToCart = () => {
    if (!user) return alert("Please login to add items to cart");
    dispatch(addToCart({ userId: user.id, product: { ...selected, quantity } }));
    showNotification("✅ Product successfully added to cart!");
  };

  const handleBuyNow = () => {
    if (!user) return alert("Please login to buy");
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

  // Exclude fields we already display separately
  const excludedFields = ["id", "name", "image", "offerPrice", "originalPrice", "offers", "rating", "description"];
  const dynamicFields = Object.entries(selected).filter(
    ([key]) => !excludedFields.includes(key)
  );

  return (
    <div className="product-detail-container">
      {/* ✅ Toast Notification */}
      {notification && <div className="notification-box">{notification}</div>}

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
          <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>

        <div className="product-description">
          <h3>Description</h3>
          <p>{selected.description}</p>
        </div>

        {/* Dynamic fields table */}
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

    {checkoutOpen && (
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
