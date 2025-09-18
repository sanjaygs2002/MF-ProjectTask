import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "host/cartSlice";
import { fetchProductById } from "host/productsSlice";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  if (!selected) return <p>Loading...</p>;

  const handleAddToCart = () => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }
    dispatch(addToCart({ userId: user.id, product: selected }));
    alert("Product added to cart!");
  };

  // ⭐ Render stars based on rating
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
    <div className="product-detail">
      <img
        src={`http://localhost:8083/images/${selected.image}`}
        alt={selected.name}
        className="product-detail-img"
      />

      <div className="detail-info">
        <h2>{selected.name}</h2>

        {/* ⭐ Rating */}
        <p className="rating">{renderStars(selected.rating)} ({selected.rating})</p>

        {/* 🎁 Offer */}
        {selected.offers && (
          <p className="offer">{selected.offers}</p>
        )}

        {/* 🎨 Color */}
        {selected.color && (
          <p className="color">
            Color:{" "}
            <span
              className="color-badge"
              style={{ backgroundColor: selected.color.toLowerCase() }}
            ></span>{" "}
            {selected.color}
          </p>
        )}

        <p className="price">₹{selected.price}</p>
        <p className="description">{selected.description}</p>

        <button className="btn-cart" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;
