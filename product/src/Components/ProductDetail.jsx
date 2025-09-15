import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById } from "host/store";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected, status } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  if (status === "loading" || !selected) return <p>Loading...</p>;

  return (
    <div className="product-detail">
      <img
        src={`http://localhost:8083/images/${selected.image}`}
        alt={selected.name}
        className="detail-img"
      />
      <div className="detail-info">
        <h2>{selected.name}</h2>
        <p className="price">₹{selected.price}</p>
        <p>{selected.description}</p>
        <button
          onClick={() => {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart.push(selected);
            localStorage.setItem("cart", JSON.stringify(cart));
            alert("Product added to cart!");
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;
