import { render, screen, fireEvent, act } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { BrowserRouter } from "react-router-dom";
import CartPage from "./CartPage";

// ✅ Mock Redux actions
jest.mock("host/cartSlice", () => ({
  fetchCart: jest.fn(() => ({ type: "FETCH_CART" })),
  updateCartQuantity: jest.fn(() => ({ type: "UPDATE_CART_QTY" })),
  removeFromCart: jest.fn(() => ({ type: "REMOVE_FROM_CART" })),
  openCheckout: jest.fn(() => ({ type: "OPEN_CHECKOUT" })),
  closeCheckout: jest.fn(() => ({ type: "CLOSE_CHECKOUT" })),
  placeOrder: jest.fn(() => Promise.resolve({ type: "PLACE_ORDER" })),
}));

import {
  updateCartQuantity,
  removeFromCart,
} from "host/cartSlice";

const mockStore = configureStore([]);

describe("🛒 Cart Page Functionalities (Notification-Based)", () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      auth: { user: { id: 1, email: "test@gmail.com" } },
      cart: {
        items: [
          { id: "1", name: "Silver Watch", offerPrice: 2500, quantity: 2 },
          { id: "2", name: "Leather Watch", offerPrice: 3000, quantity: 2 },
        ],
        checkoutOpen: false,
      },
    });
  });

  const renderCart = () =>
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      </Provider>
    );

  // ✅ 1️⃣ Checkbox toggle test (with DOM re-query)
  test("should toggle item selection correctly", async () => {
    renderCart();

    // Get initial checkboxes
    let checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);

    // Click second item checkbox
    await act(async () => {
      fireEvent.click(checkboxes[1]);
    });

    // Re-query after update (important!)
    checkboxes = await screen.findAllByRole("checkbox");
    expect(checkboxes[1].checked).toBe(true);

    // Click select all
    await act(async () => {
      fireEvent.click(checkboxes[0]);
    });
    checkboxes = await screen.findAllByRole("checkbox");
    expect(checkboxes[0].checked).toBe(true);

    // Deselect all
    await act(async () => {
      fireEvent.click(checkboxes[0]);
    });
    checkboxes = await screen.findAllByRole("checkbox");
    expect(checkboxes[0].checked).toBe(false);
  });

  // ✅ 2️⃣ Quantity update
  test("should update quantity and show notification", async () => {
    jest.useFakeTimers();
    renderCart();

    const plus = screen.getAllByText("+")[0];
    const minus = screen.getAllByText("-")[0];

    await act(async () => {
      fireEvent.click(plus);
    });
    expect(updateCartQuantity).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Cart updated/i)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(minus);
    });
    expect(updateCartQuantity).toHaveBeenCalledTimes(2);

    act(() => jest.runAllTimers());
    jest.useRealTimers();
  });

  // ✅ 3️⃣ Cart Removal
  test("should remove item from cart and show notification", async () => {
    renderCart();
    const removeBtns = screen.getAllByText(/remove/i);

    await act(async () => {
      fireEvent.click(removeBtns[0]);
    });

    expect(removeFromCart).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Item removed/i)).toBeInTheDocument();
  });

  // ✅ 4️⃣ Notifications
  test("should show correct notification messages for actions", async () => {
    renderCart();

    const plus = screen.getAllByText("+")[0];
    await act(async () => {
      fireEvent.click(plus);
    });
    expect(screen.getByText(/Cart updated/i)).toBeInTheDocument();

    const removeBtns = screen.getAllByText(/remove/i);
    await act(async () => {
      fireEvent.click(removeBtns[0]);
    });
    expect(screen.getByText(/Item removed/i)).toBeInTheDocument();
  });
});
