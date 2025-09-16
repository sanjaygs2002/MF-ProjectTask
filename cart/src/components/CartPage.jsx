import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "host/cartSlice"; 




function CartPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, status } = useSelector((state) => state.cart);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, user]);

  if (!user) return <p>Please login to view cart</p>;
  if (status === "loading") return <p>Loading cart...</p>;

  return (
  <div style={{ padding: "20px" }}>
    <h2>Your Cart</h2>
    {items.length === 0 ? (
      <p>No items in cart</p>
    ) : (
      <>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: "flex", gap: "15px", marginBottom: "10px" }}>
            <img
              src={`http://localhost:8083/images/${item.image}`}
              alt={item.name}
              width="100"
            />
            <div>
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
            </div>
          </div>
        ))}
        <hr />
        <h3>
          Total: ₹
          {items.reduce((total, item) => total + Number(item.price), 0).toFixed(2)}
        </h3>
      </>
    )}
  </div>
);
}

export default CartPage;