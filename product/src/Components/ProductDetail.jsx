import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "host/cartSlice";
import { fetchProductById } from "host/productsSlice";
import { placeOrderDirect } from "host/orderSlice"; // Buy Now logic
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    address: "",
    phone: "",
    payment: "Cash on Delivery",
  });

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  if (!selected) return <p>Loading...</p>;

  const totalPrice = (selected.offerPrice || selected.price) * quantity;

  const handleAddToCart = () => {
    if (!user) return alert("Please login to add items to cart");
    dispatch(addToCart({ userId: user.id, product: { ...selected, quantity } }));
    alert("Product added to cart!");
  };

  const handleBuyNow = () => {
    if (!user) return alert("Please login to buy");
    setCheckoutOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return alert("Please login first");

    dispatch(
      placeOrderDirect({
        userId: user.id,
        userInfo: formData,
        product: { ...selected, quantity, totalPrice },
      })
    );

    setCheckoutOpen(false);
    alert("Order placed successfully!");
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

  return (
    <div className="product-detail-container">
      {/* Left: Image */}
      <div className="image-section">
        <img
          src={`http://localhost:8083/images/${selected.image}`}
          alt={selected.name}
          className="product-detail-img"
        />
      </div>

      {/* Right: Details */}
      <div className="info-section">
        <h2 className="product-title">{selected.name}</h2>

        <div className="rating">
          <span className="stars">{renderStars(selected.rating)}</span>
          <span className="rating-value">({selected.rating})</span>
        </div>

        <div className="price-section">
          <span className="offer-price">₹{selected.offerPrice}</span>
          <span className="original-price">₹{selected.originalPrice}</span>
        </div>

        {selected.color && (
          <div className="color-section">
            <span>Color:</span>
            <span
              className="color-badge"
              style={{ backgroundColor: selected.color.toLowerCase() }}
            ></span>
            <span>{selected.color}</span>
          </div>
        )}

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

        <div className="action-buttons">
          <button className="btn-add-cart" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button className="btn-buy" onClick={handleBuyNow}>
            Buy Now - ₹{totalPrice.toFixed(2)}
          </button>
        </div>
      </div>

      {/* Checkout Popup */}
      {checkoutOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Checkout</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <select
                value={formData.payment}
                onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Online Payment">Online Payment</option>
              </select>
              <button type="submit" className="checkout-btn confirm">
                Place Order
              </button>
              <button type="button" className="cancel" onClick={() => setCheckoutOpen(false)}>
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
