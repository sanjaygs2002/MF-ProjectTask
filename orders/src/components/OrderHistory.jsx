import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, cancelOrder } from "host/store";
import {
  FaClipboardList,
  FaCheckCircle,
  FaTruck,
  FaShippingFast,
  FaBoxOpen,
  FaTimesCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "./OrderHistory.css";

function OrderHistory() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.items);
  const { user } = useSelector((state) => state.auth);
  const [openOrder, setOpenOrder] = useState(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchOrders(user.id));
    }
  }, [dispatch, user]);

  const handleCancelOrder = (orderId) => {
    dispatch(cancelOrder({ userId: user.id, orderId }));
  };

  const canCancel = (orderDate) => {
    const diffHours = (Date.now() - new Date(orderDate).getTime()) / (1000 * 60 * 60);
    return diffHours <= 6;
  };

  const stages = [
    { name: "Placed", icon: <FaClipboardList /> },
    { name: "Confirmed", icon: <FaCheckCircle /> },
    { name: "Shipped", icon: <FaTruck /> },
    { name: "Out for Delivery", icon: <FaShippingFast /> },
    { name: "Delivered", icon: <FaBoxOpen /> },
  ];

  const calculateTotal = (items) =>
    items.reduce((total, item) => total + Number(item.offerPrice || 0) * (item.quantity || 1), 0);

  const toggleAccordion = (id) => {
    setOpenOrder(openOrder === id ? null : id);
  };

  return (
    <div className="order-history-container">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        orders.map((order) => {
          const diffHours =
            (Date.now() - new Date(order.date).getTime()) / (1000 * 60 * 60);
          const isOpen = openOrder === order.id;

          return (
            <div key={order.id} className="order-accordion">
              {/* Accordion Header */}
              <div className="accordion-header" onClick={() => toggleAccordion(order.id)}>
                <div>
                  <strong>Order ID:</strong> {order.id}
                  <p className="order-date">
                    {new Date(order.date).toLocaleString()}
                  </p>
                </div>
                <div className="accordion-icon">
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {/* Accordion Body */}
              {isOpen && (
                <div className="accordion-body">
                  {/* Timeline */}
                  <div className="timeline-container">
                    {stages.map((stage, idx) => {
                      const isActive =
                        diffHours >= idx * 0.01 && order.status !== "Cancelled";
                      const isCancelled = order.status === "Cancelled";
                      return (
                        <div key={idx} className="timeline-stage">
                          <div
                            className={`timeline-box ${
                              isActive ? "active-stage" : ""
                            } ${isCancelled ? "cancelled-stage" : ""}`}
                            title={
                              isCancelled && idx === 0
                                ? "Order cancelled within 6 hours"
                                : stage.name
                            }
                          >
                            {isCancelled && idx === 0 ? (
                              <FaTimesCircle color="#ff4d4f" />
                            ) : (
                              stage.icon
                            )}
                            <span>{stage.name}</span>
                          </div>
                          {idx < stages.length - 1 && (
                            <div
                              className={`timeline-line ${
                                isActive ? "active-line" : ""
                              } ${isCancelled ? "cancelled-line" : ""}`}
                            ></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Order items */}
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div key={item.id || item.name} className="order-item">
                        <img
                          src={`http://localhost:8083/images/${item.image}`}
                          alt={item.name}
                          className="order-item-img"
                        />
                        <div>
                          <p>{item.name}</p>
                          <p>
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#999",
                                marginRight: "5px",
                              }}
                            >
                              ₹{Number(item.originalPrice || 0)}
                            </span>
                            ₹{Number(item.offerPrice || 0)}
                          </p>
                          <p>Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="total-price">
                    Total Price: ₹{calculateTotal(order.items).toFixed(2)}
                  </p>

                  {(order.status === "Placed" ||
                    order.status === "Confirmed") && (
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={!canCancel(order.date)}
                      title={
                        canCancel(order.date)
                          ? "Cancel your order"
                          : "Cancellation period expired (6 hours)"
                      }
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default OrderHistory;
