import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "host/store";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";

function ProductList({ search = "", category = "All", price = 2000 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list = [], status } = useSelector((s) => s.products || {});

  const [showScroll, setShowScroll] = useState(false);

  // Fetch products
  useEffect(() => {
    if (status === "idle") dispatch(fetchProducts());
  }, [dispatch, status]);

  // Scroll button logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filtering products
  const filteredProducts = list.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || p.category?.toLowerCase() === category.toLowerCase();
    const matchesPrice = !price || p.offerPrice <= price;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleViewDetails = (id) => {
    navigate(`/products/${id}`);
  };

  return (
    <div className="product-page">
      <div className="product-container">
        {filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.id} className="product-card">
              <img
                src={`http://localhost:8083/images/${p.image}`}
                alt={p.name}
                className="product-img"
              />
              <h3>{p.name}</h3>
              <p className="price">
                <span className="old-price">₹{p.originalPrice}</span>{" "}
                <span className="offer-price">₹{p.offerPrice}</span>
              </p>
              <button
                onClick={() => handleViewDetails(p.id)}
                className="view-btn"
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* Scroll-to-top button */}
      {showScroll && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
}

export default ProductList;
