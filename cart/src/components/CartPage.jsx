import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, updateCartQuantity, removeFromCart } from "host/cartSlice";
import "./CartPage.css"; // ✅ custom CSS

function CartPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, status } = useSelector((state) => state.cart);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, user]);

  if (!user) return <p className="cart-msg">Please login to view cart</p>;
  if (status === "loading") return <p className="cart-msg">Loading cart...</p>;

  const handleIncrease = (item) => {
    dispatch(updateCartQuantity({ userId: user.id, productId: item.id, quantity: item.quantity + 1 }));
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      dispatch(updateCartQuantity({ userId: user.id, productId: item.id, quantity: item.quantity - 1 }));
    }
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart({ userId: user.id, productId: item.id }));
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">🛒 Your Cart</h2>
      {items.length === 0 ? (
        <p className="cart-msg">No items in cart</p>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item, idx) => (
              <div key={idx} className="cart-item">
                <img
                  src={`http://localhost:8083/images/${item.image}`}
                  alt={item.name}
                  className="cart-img"
                />
                <div className="cart-info">
                  <h4>{item.name}</h4>
                  <p className="price">₹{item.price}</p>
                  <div className="quantity-control">
                    <button onClick={() => handleDecrease(item)}>-</button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => handleIncrease(item)}>+</button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => handleRemove(item)}>❌</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>
              Total: ₹
              {items.reduce(
                (total, item) => total + Number(item.price) * (item.quantity || 1),
                0
              ).toFixed(2)}
            </h3>
            <button className="checkout-btn">Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
