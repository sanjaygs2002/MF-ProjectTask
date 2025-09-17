// ProductList.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "host/store";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";


function ProductList({ search = "", category = "All" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list = [], status } = useSelector((s) => s.products || {});
  const { user } = useSelector((s) => s.auth || {});

  useEffect(() => {
    if (status === "idle") dispatch(fetchProducts());
  }, [dispatch, status]);

  const filteredProducts = list.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || p.gender.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleViewDetails = (id) => {
    if (!user) navigate(`/login?redirect=/products/${id}`);
    else navigate(`/products/${id}`);
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
              <p className="price">₹{p.price}</p>
              <button onClick={() => handleViewDetails(p.id)}>View Details</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default ProductList;

