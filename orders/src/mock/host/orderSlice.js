// src/mock/host/orderSlice.js

export const fetchOrders = jest.fn((userId) => ({
  type: "FETCH_ORDERS",
  payload: { userId },
}));

export const cancelOrder = jest.fn(({ userId, orderId }) => ({
  type: "CANCEL_ORDER",
  payload: { userId, orderId },
}));

// Mock a default export reducer (if needed)
export default function orderReducer(state = { items: [] }, action) {
  switch (action.type) {
    case "FETCH_ORDERS":
      return state;
    case "CANCEL_ORDER":
      return {
        ...state,
        items: state.items.filter((order) => order.id !== action.payload.orderId),
      };
    default:
      return state;
  }
}
