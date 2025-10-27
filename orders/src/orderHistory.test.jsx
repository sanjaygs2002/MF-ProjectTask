// src/orderHistory.test.jsx
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { BrowserRouter } from "react-router-dom";
import OrderHistory from "./components/OrderHistory";

// ✅ Mock Redux store setup
const mockStore = configureStore([]);

// ✅ Mock host/store functions (no thunk)
jest.mock("host/store", () => ({
  fetchOrders: jest.fn(() => ({ type: "FETCH_ORDERS" })),
  cancelOrder: jest.fn(() => ({ type: "CANCEL_ORDER" })),
}));

import { fetchOrders, cancelOrder } from "host/store";

describe("📦 OrderHistory Component Functional Tests", () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      auth: { user: { id: 1, email: "test@gmail.com" } },
      orders: {
        items: [
          {
            id: "1",
            date: new Date().toISOString(),
            status: "PLACED",
            items: [
              {
                id: "p1",
                name: "Classic Silver Watch",
                offerPrice: 2500,
                quantity: 1,
                image: "watch.jpg",
              },
            ],
          },
        ],
      },
    });
  });

  const renderOrders = () =>
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OrderHistory />
        </BrowserRouter>
      </Provider>
    );

  // ✅ 1️⃣ Should render product details correctly
  test("renders product details correctly", () => {
    renderOrders();

    expect(screen.getByText(/Your Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/Classic Silver Watch/i)).toBeInTheDocument();
    expect(screen.getByText(/₹2500/i)).toBeInTheDocument();
  });

  // ✅ 2️⃣ Should filter orders by date
  test("filters orders by selected date", async () => {
    renderOrders();

    const input = screen.getByLabelText(/Filter by Date/i);
    const today = new Date().toISOString().slice(0, 10);

    await act(async () => {
      fireEvent.change(input, { target: { value: today } });
    });

    expect(input.value).toBe(today);
    expect(screen.getByText(/Order ID/i)).toBeInTheDocument();
  });

  // ✅ 3️⃣ Should clear filter when Clear button is clicked
  test("clears filter when Clear button clicked", async () => {
    renderOrders();

    const input = screen.getByLabelText(/Filter by Date/i);
    const today = new Date().toISOString().slice(0, 10);

    fireEvent.change(input, { target: { value: today } });
    expect(input.value).toBe(today);

    fireEvent.click(screen.getByText(/Clear/i));
    expect(input.value).toBe("");
  });

  // ✅ 4️⃣ Should display Cancel Order button and call cancelOrder on click
  test("calls cancelOrder when Cancel button clicked", async () => {
    renderOrders();

    // Expand order details if required
    const orderHeader = screen.getByText(/Order ID:/i);
    fireEvent.click(orderHeader);

    const cancelBtn = await screen.findByText(/Cancel Order/i);

    await act(async () => {
      fireEvent.click(cancelBtn);
    });

    expect(cancelOrder).toHaveBeenCalledTimes(1);
    expect(cancelOrder).toHaveBeenCalledWith({ userId: 1, orderId: "1" });
  });

  // ✅ 5️⃣ Should show “No orders found” when empty
  test("shows no orders found message when order list empty", () => {
    store = mockStore({
      auth: { user: { id: 1, email: "test@gmail.com" } },
      orders: { items: [] },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <OrderHistory />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/No orders found/i)).toBeInTheDocument();
  });
});
