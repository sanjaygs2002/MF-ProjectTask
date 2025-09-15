import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "host/store";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";

function ProductList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list, status, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth); // ✅ get logged in user

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  if (status === "loading") return <p>Loading products...</p>;
  if (status === "failed") return <p>Error: {error}</p>;

  const handleViewDetails = (id) => {
    if (!user) {
      alert("⚠️ Please login to continue");
      navigate("/login");
    } else {
      navigate(`/products/${id}`);
    }
  };

  return (
    <div className="product-container">
      {list.length === 0 ? (
        <p>No products found.</p>
      ) : (
        list.map((p) => (
          <div key={p.id} className="product-card">
            <img
              src={`http://localhost:8083/images/${p.image}`}
              alt={p.name}
              className="product-img"
            />
            <h3>{p.name}</h3>
            <p className="price">₹{p.price}</p>
            <button onClick={() => handleViewDetails(p.id)}>
              View Details
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ProductList;
