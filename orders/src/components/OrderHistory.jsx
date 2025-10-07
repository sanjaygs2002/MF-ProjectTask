import { useEffect, useState } from "react";
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
import {
  CANCEL_HOURS_LIMIT,
  ORDER_STATUS,
  TIMELINE_STAGES,DEFAULT_QUANTITY, DEFAULT_PRICE,
} from "../constant/OrderHistoryConst";
import "./OrderHistory.css";


const ICON_MAP = {
  FaClipboardList: <FaClipboardList />,
  FaCheckCircle: <FaCheckCircle />,
  FaTruck: <FaTruck />,
  FaShippingFast: <FaShippingFast />,
  FaBoxOpen: <FaBoxOpen />,
};

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
    return diffHours <= CANCEL_HOURS_LIMIT;
  };

 const calculateTotal = (items) =>
  items.reduce(
    (total, item) =>
      total +
      Number(item.offerPrice ?? DEFAULT_PRICE) *
        (item.quantity ?? DEFAULT_QUANTITY),
    0
  );

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
          const diffHours = (Date.now() - new Date(order.date).getTime()) / (1000 * 60 * 60);
          const isOpen = openOrder === order.id;
          const orderStatus = order.status;

          return (
            <div key={order.id} className="order-accordion">
           
              <div className="accordion-header" onClick={() => toggleAccordion(order.id)}>
                <div>
                  <strong>Order ID:</strong> {order.id}
                  <p className="order-date">{new Date(order.date).toLocaleString()}</p>
                </div>
                <div className="accordion-icon">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</div>
              </div>

           
              {isOpen && (
                <div className="accordion-body">
                 
                  <div className="timeline-container">
                    {TIMELINE_STAGES.map((stage, idx) => {
                      const isCancelled = orderStatus === ORDER_STATUS.CANCELLED;
                      const isActive = diffHours >= (idx + 1) * CANCEL_HOURS_LIMIT && !isCancelled;

                      return (
                        <div key={idx} className="timeline-stage">
                          <div
                            className={`timeline-box ${isActive ? "active-stage" : ""} ${
                              isCancelled ? "cancelled-stage" : ""
                            }`}
                            title={
                              diffHours < CANCEL_HOURS_LIMIT
                                ? `Order is pending. You can cancel within ${CANCEL_HOURS_LIMIT} hours.`
                                : `${stage.name} stage started after ${(idx + 1) * CANCEL_HOURS_LIMIT} hours.`
                            }
                          >
                            {isCancelled && idx === 0 ? (
                              <FaTimesCircle color="#ff4d4f" />
                            ) : (
                              ICON_MAP[stage.iconName]
                            )}
                            <span>{stage.name}</span>
                          </div>
                          {idx < TIMELINE_STAGES.length - 1 && (
                            <div
                              className={`timeline-line ${isActive ? "active-line" : ""} ${
                                isCancelled ? "cancelled-line" : ""
                              }`}
                            ></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

              
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

                  <p className="total-price">Total Price: ₹{calculateTotal(order.items).toFixed(2)}</p>

               
                  {canCancel(order.date) && orderStatus !== ORDER_STATUS.CANCELLED && (
                    <button
                      className="cancel-btn"
                      title={`You can cancel your order within ${CANCEL_HOURS_LIMIT} hours of placing it.`}
                      onClick={() => handleCancelOrder(order.id)}
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
