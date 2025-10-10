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
  TIMELINE_STAGES,
  DEFAULT_QUANTITY,
  DEFAULT_PRICE,
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
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchOrders(user.id));
    }
  }, [dispatch, user]);

  const handleCancelOrder = (orderId) => {
    dispatch(cancelOrder({ userId: user.id, orderId }));
  };

  const canCancel = (orderDate) => {
    const diffHours =
      (Date.now() - new Date(orderDate).getTime()) / (1000 * 60 * 60);
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

  // Filter orders based on selected date
  const filteredOrders = filterDate
    ? orders.filter(
        (order) =>
          new Date(order.date).toISOString().slice(0, 10) === filterDate
      )
    : orders;

  return (
    <div className="order-history-container">
      <h2>Your Orders</h2>

      {/* Date Filter */}
      <div className="filter-container">
        <label htmlFor="order-date">Filter by Date: </label>
        <input
          type="date"
          id="order-date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        {filterDate && (
          <button onClick={() => setFilterDate("")} className="clear-btn">
            Clear
          </button>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <p>No orders found for this date.</p>
      ) : (
        [...filteredOrders]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((order) => {
            const diffHours =
              (Date.now() - new Date(order.date).getTime()) / (1000 * 60 * 60);
            const isOpen = openOrder === order.id;
            const orderStatus = order.status;

            return (
              <div key={order.id} className="order-accordion">
                <div
                  className="accordion-header"
                  onClick={() => toggleAccordion(order.id)}
                >
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

                {isOpen && (
                  <div className="accordion-body">
                    <div className="timeline-container">
  {TIMELINE_STAGES.map((stage, idx) => {
    const isCancelled = orderStatus === ORDER_STATUS.CANCELLED;

    // Determine if this stage should be active (green)
    let isActive = false;

    if (isCancelled) {
      isActive = false; // nothing green when cancelled
    } else {
      // Stage activation timing (e.g. 2 hours each stage)
      const stageTime = (idx + 1) * CANCEL_HOURS_LIMIT;

      // First stage (Placed) is always green immediately
      if (idx === 0) {
        isActive = true;
      }
      // Other stages activate gradually after certain hours
      else if (diffHours >= stageTime) {
        isActive = true;
      }
    }

    return (
      <div key={idx} className="timeline-stage">
        <div
          className={`timeline-box ${
            isActive ? "active-stage" : ""
          } ${isCancelled ? "cancelled-stage" : ""}`}
          title={
            isCancelled
              ? "Order Cancelled"
              : isActive
              ? `${stage.name} completed`
              : `${stage.name} pending`
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
            className={`timeline-line ${
              isActive ? "active-line" : ""
            } ${isCancelled ? "cancelled-line" : ""}`}
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

                    <p className="total-price">
                      Total Price: ₹{calculateTotal(order.items).toFixed(2)}
                    </p>

                    {canCancel(order.date) &&
                      orderStatus !== ORDER_STATUS.CANCELLED && (
                        <button
                          className="cancel-btn"
                          title={`You can cancel your order within ${CANCEL_HOURS_LIMIT} hours of comfirmed it.`}
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
