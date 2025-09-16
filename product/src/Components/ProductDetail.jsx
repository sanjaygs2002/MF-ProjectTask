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

  return (
    <div className="product-detail">
      <img
        src={`http://localhost:8083/images/${selected.image}`}
        alt={selected.name}
        className="product-detail-img"   
      />
      <div className="detail-info">
        <h2>{selected.name}</h2>
        <p className="price">₹{selected.price}</p>
        <p className="description">{selected.description}</p> {/* ✅ add description class */}
        <button className="btn-cart" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;
