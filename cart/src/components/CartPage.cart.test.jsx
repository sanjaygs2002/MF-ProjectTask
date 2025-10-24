import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import CartPage from "./CartPage";
import { BrowserRouter } from "react-router-dom";
import { updateCartQuantity, removeFromCart } from "host/cartSlice";

// ✅ Mock toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));
import { toast } from "react-toastify";

// ✅ Mock Redux actions (from shell MFE)
jest.mock("host/cartSlice", () => ({
  updateCartQuantity: jest.fn(() => ({ type: "UPDATE_CART_QTY" })),
  removeFromCart: jest.fn(() => ({ type: "REMOVE_FROM_CART" })),
  fetchCart: jest.fn((userId) => ({ type: "FETCH_CART", payload: userId })),
}));


const mockStore = configureStore([]);

describe("🛒 Cart Page Functionalities (Toast Based)", () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      auth: { user: { id: 1, email: "sanjay@gmail.com" } },
      cart: {
        items: [
          {
            id: "1",
            name: "Classic Silver Watch",
            offerPrice: 2500,
            quantity: 1,
          },
          {
            id: "2",
            name: "Leather Strap Watch",
            offerPrice: 3000,
            quantity: 2,
          },
        ],
        checkoutOpen: false,
      },
    });
  });

  // 1️⃣ Select & Deselect Items
  test("should toggle item selection correctly", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      </Provider>
    );

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0].checked).toBe(false);

    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1].checked).toBe(true);
  });

  // 2️⃣ Quantity Management
  test("should increase and decrease quantity", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      </Provider>
    );

    const plusButtons = screen.getAllByText("+");
    const minusButtons = screen.getAllByText("-");

    fireEvent.click(plusButtons[0]);
    expect(updateCartQuantity).toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalled();

    fireEvent.click(minusButtons[0]);
    expect(updateCartQuantity).toHaveBeenCalled();
  });

  // 3️⃣ Cart Removal
  test("should remove item from cart when Remove clicked", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      </Provider>
    );

    const removeButtons = screen.getAllByText(/remove/i);
    fireEvent.click(removeButtons[0]);

    expect(removeFromCart).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  // 4️⃣ Toast Notifications for Quantity & Removal
  test("should show toast notifications when quantity changes or item removed", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      </Provider>
    );

    const plusButtons = screen.getAllByText("+");
    fireEvent.click(plusButtons[0]);
    expect(toast.info).toHaveBeenCalled();

    const removeButtons = screen.getAllByText(/remove/i);
    fireEvent.click(removeButtons[0]);
    expect(toast.success).toHaveBeenCalled();
  });
});


