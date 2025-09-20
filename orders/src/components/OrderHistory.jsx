import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, cancelOrder } from "host/store"; 
import "./OrderHistory.css";

export default function OrderHistory({ userId }) {
  const dispatch = useDispatch();
  const { items: orders, status, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (userId) {
      dispatch(fetchOrders(userId));
    }
  }, [userId, dispatch]);

  const handleCancel = (orderId) => {
    dispatch(cancelOrder({ userId, orderId }));
  };

  const calculateTotal = (items) => {
  return items
    .reduce((acc, item) => acc + (parseFloat(item.offerPrice) * (item.quantity || 1)), 0)
    .toFixed(2);
};


  const canCancel = (orderDate) => {
    const placedTime = new Date(orderDate).getTime();
    const now = Date.now();
    const diffHours = (now - placedTime) / (1000 * 60 * 60); // convert ms → hours
    return diffHours <= 6;
  };

  return (
    <div className="order-history-container">
      <h2>Order History</h2>

      {status === "loading" && <p>Loading orders...</p>}
      {status === "failed" && <p className="error">Error: {error}</p>}
      {status === "succeeded" && orders.length === 0 && <p>No orders found</p>}

      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <h3>Order #{order.id}</h3>
            <p>
              Status:{" "}
              <span className={order.status.toLowerCase()}>{order.status}</span>
            </p>
            <p>Date: {new Date(order.date).toLocaleString()}</p>
          </div>

          <div className="order-items">
            {order.items.map((item) => (
              <div key={item.id} className="order-item">
                <img
                  src={`http://localhost:8083/images/${item.image}`}
                  alt={item.name}
                  className="order-item-img"
                />
                <div className="order-item-details">
                  <p>{item.name}</p>
                  <p>Qty: {item.quantity || 1}</p>
                 <p className="total-price">
  Total Price: ₹{calculateTotal(order.items)}
</p>

                </div>
              </div>
            ))}
          </div>

          {/* ✅ Cancel logic */}
          {order.status !== "Cancelled" && (
            <>
              {canCancel(order.date) ? (
  <div className="tooltip-wrapper">
    <button
      className="cancel-btn"
      onClick={() => handleCancel(order.id)}
    >
      Cancel Order
    </button>
    <span className="tooltip-text">Cancel order within 6 hours</span>
  </div>
) : (
  <p className="cancel-msg">
    ⚠️ Order can’t be cancelled after 6 hours.
  </p>
)}

            </>
          )}
        </div>
      ))}
    </div>
  );
}
