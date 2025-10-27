// src/mock/host/store.js

// 🧠 These mocks simulate Redux actions from the remote host microfrontend
export const fetchOrders = jest.fn((userId) => ({
  type: "FETCH_ORDERS",
  payload: { userId },
}));

export const cancelOrder = jest.fn(({ userId, orderId }) => ({
  type: "CANCEL_ORDER",
  payload: { userId, orderId },
}));

// Optional: export anything else your OrderHistory might import from host/store
export const mockOrders = [
  {
    id: "ORD001",
    date: new Date().toISOString(),
    status: "Delivered",
    items: [
      { id: "1", name: "Silver Watch", offerPrice: 2500, quantity: 1, image: "watch1.jpg" },
    ],
  },
];
