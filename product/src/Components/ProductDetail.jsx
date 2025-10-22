import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "host/cartSlice";
import { fetchProductById } from "host/productsSlice";
import { placeOrderDirect } from "host/orderSlice";
import "./ProductDetail.css";
import {
  NOTIFY_COLOR,
  MESSAGES,
  PAYMENT_METHODS,
  DEFAULT_PAYMENT,
  FORM_ERRORS,
  IMAGE_BASE_URL,
  NOTIFY_DURATION,
  EXCLUDED_FIELDS,
} from "../Constant/ProdDetailConst";

function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  // ✅ All hooks declared at top level
  const [quantity, setQuantity] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentImage, setCurrentImage] = useState(0);

  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    address: user?.address || "",
    phone: user?.phone || "",
    payment: DEFAULT_PAYMENT,
  });

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  if (!selected) return <p>Loading...</p>;

  const totalPrice = (selected.offerPrice || selected.price) * quantity;

  // ✅ Carousel images with fallback
  const images = selected.images && selected.images.length > 0
    ? selected.images
    : [selected.image];

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  // ✅ Notification logic
  const showNotification = (msg, color = NOTIFY_COLOR.INFO) => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), NOTIFY_DURATION);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = FORM_ERRORS.NAME_REQUIRED;
    if (!formData.email) newErrors.email = FORM_ERRORS.EMAIL_REQUIRED;
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = FORM_ERRORS.INVALID_EMAIL;
    if (!formData.address.trim()) newErrors.address = FORM_ERRORS.ADDRESS_REQUIRED;
    if (!formData.phone) newErrors.phone = FORM_ERRORS.PHONE_REQUIRED;
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = FORM_ERRORS.INVALID_PHONE;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) return showNotification(MESSAGES.LOGIN_FIRST, NOTIFY_COLOR.ERROR);

    dispatch(
      placeOrderDirect({
        userId: user.id,
        userInfo: formData,
        product: { ...selected, quantity, totalPrice },
      })
    );

    setCheckoutOpen(false);
    showNotification(MESSAGES.ORDER_PLACED, NOTIFY_COLOR.SUCCESS);
  };

  const handleAddToCart = () => {
    if (!user)
      return showNotification(MESSAGES.LOGIN_TO_ADD, NOTIFY_COLOR.ERROR);
    dispatch(addToCart({ userId: user.id, product: { ...selected, quantity } }));
    showNotification(MESSAGES.PRODUCT_ADDED, NOTIFY_COLOR.INFO);
  };

  const handleBuyNow = () => {
    if (!user) return showNotification(MESSAGES.LOGIN_TO_BUY, NOTIFY_COLOR.ERROR);
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

  const dynamicFields = Object.entries(selected).filter(
    ([key]) => !EXCLUDED_FIELDS.includes(key)
  );

  return (
    <div className="product-detail-container">
      {/* ✅ Notification */}
      {notification && (
        <div
          className="notification-box"
          style={{ background: notification.color }}
        >
          {notification.msg}
        </div>
      )}

      {/* ✅ Image Carousel */}
      <div className="image-section">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <div className="carousel-wrapper">
          <button className="carousel-btn left" onClick={prevImage}>
            ❮
          </button>
          <img
            src={`${IMAGE_BASE_URL}${images[currentImage]}`}
            alt={selected.name}
            className="product-detail-img"
          />
          <button className="carousel-btn right" onClick={nextImage}>
            ❯
          </button>
        </div>
        <div className="thumbnail-container">
          {images.map((img, index) => (
            <img
              key={index}
              src={`${IMAGE_BASE_URL}${img}`}
              alt="thumb"
              className={`thumbnail ${index === currentImage ? "active" : ""}`}
              onClick={() => setCurrentImage(index)}
            />
          ))}
        </div>
      </div>

      {/* ✅ Product Info */}
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
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
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
