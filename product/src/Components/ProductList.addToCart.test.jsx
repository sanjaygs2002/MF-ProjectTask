import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import ProductList from "./ProductList";
import * as cartSlice from "host/cartSlice";

// ✅ Mock all Redux actions to return plain objects
jest.mock("host/cartSlice", () => ({
  addToCart: jest.fn(() => ({ type: "ADD_TO_CART" })),
  updateCartQuantity: jest.fn(() => ({ type: "UPDATE_CART" })),
  removeFromCart: jest.fn(() => ({ type: "REMOVE_FROM_CART" })),
}));

// ✅ Mock react-router
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// ✅ Minimal no-op reducer
const reducer = (state) => state;

// ✅ Helper render function
const renderWithStore = (state) =>
  render(
    <Provider store={createStore(reducer, state)}>
      <ProductList />
    </Provider>
  );

describe("🛒 ProductList - Add to Cart Functionality", () => {
  const mockProduct = {
    id: 1,
    name: "Classic Silver Watch",
    offerPrice: 1000,
    originalPrice: 1200,
    image: "watch.jpg",
  };

  beforeEach(() => jest.clearAllMocks());

  // 1️⃣ User not logged in
  test("Shows notification when user not logged in", async () => {
    renderWithStore({
      products: { list: [mockProduct], status: "succeeded" },
      auth: { user: null },
      cart: { items: [] },
    });

    fireEvent.click(screen.getByText("Add to Cart"));

    // ✅ Wait for async notification message
    await waitFor(() =>
      expect(screen.getByText(/login/i)).toBeInTheDocument()
    );
  });

  // 2️⃣ Logged in user adds product
  test("Dispatches addToCart when logged in", () => {
    renderWithStore({
      products: { list: [mockProduct], status: "succeeded" },
      auth: { user: { id: 1, username: "Sanjay" } },
      cart: { items: [] },
    });

    fireEvent.click(screen.getByText("Add to Cart"));
    expect(cartSlice.addToCart).toHaveBeenCalledTimes(1);
  });

  // 3️⃣ Product already in cart shows quantity controls
  test("Quantity controls appear after adding product", () => {
    renderWithStore({
      products: { list: [mockProduct], status: "succeeded" },
      auth: { user: { id: 1 } },
      cart: { items: [{ ...mockProduct, quantity: 1 }] },
    });

    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  // 4️⃣ Clicking + increases quantity
  test("Clicking + increases quantity", () => {
    renderWithStore({
      products: { list: [mockProduct], status: "succeeded" },
      auth: { user: { id: 1 } },
      cart: { items: [{ ...mockProduct, quantity: 1 }] },
    });

    fireEvent.click(screen.getByText("+"));
    expect(cartSlice.updateCartQuantity).toHaveBeenCalled();
  });

  // 5️⃣ Clicking - reduces quantity
  test("Clicking - reduces quantity", () => {
    renderWithStore({
      products: { list: [mockProduct], status: "succeeded" },
      auth: { user: { id: 1 } },
      cart: { items: [{ ...mockProduct, quantity: 2 }] },
    });

    fireEvent.click(screen.getByText("-"));
    expect(cartSlice.updateCartQuantity).toHaveBeenCalled();
  });

  // 6️⃣ Quantity 0 → removes from cart
  test("Quantity 0 removes product", () => {
    renderWithStore({
      products: { list: [mockProduct], status: "succeeded" },
      auth: { user: { id: 1 } },
      cart: { items: [{ ...mockProduct, quantity: 1 }] },
    });

    fireEvent.click(screen.getByText("-"));
    expect(cartSlice.removeFromCart).toHaveBeenCalled();
  });
});
