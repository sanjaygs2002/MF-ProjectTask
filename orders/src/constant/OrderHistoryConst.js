
export const CANCEL_HOURS_LIMIT = 2; // for concellation 

export const ORDER_STATUS = {
  PENDING: "Pending",
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};


export const DEFAULT_QUANTITY = 1;
export const DEFAULT_PRICE = 0;



export const TIMELINE_STAGES = [
  { name: ORDER_STATUS.PLACED, iconName: "FaClipboardList" },
  { name: ORDER_STATUS.CONFIRMED, iconName: "FaCheckCircle" },
  { name: ORDER_STATUS.SHIPPED, iconName: "FaTruck" },
  { name: ORDER_STATUS.OUT_FOR_DELIVERY, iconName: "FaShippingFast" },
  { name: ORDER_STATUS.DELIVERED, iconName: "FaBoxOpen" },
];
