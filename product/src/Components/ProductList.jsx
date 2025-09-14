import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || p.gender === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="product-page">
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Male">Men</option>
          <option value="Female">Women</option>
          <option value="Unisex">Unisex</option>
        </select>
      </div>


      <div className="product-container">
        {filteredProducts.map((p) => (
          <div key={p.id} className="product-card">
        <img src={`http://localhost:8083/images/${p.image}`} alt={p.name} className="product-img" />



            <h3>{p.name}</h3>
            <p className="price">₹{p.price}</p>
            <button onClick={() => navigate(`/products/${p.id}`)}>
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
