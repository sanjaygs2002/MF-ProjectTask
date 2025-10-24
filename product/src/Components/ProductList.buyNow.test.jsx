import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { BrowserRouter } from "react-router-dom";
import ProductDetail from "./ProductDetail";


// ✅ Mock all federated Redux slices
jest.mock("host/orderSlice", () => ({
  placeOrderDirect: jest.fn(() => ({ type: "PLACE_ORDER" })),
}));

jest.mock("host/productsSlice", () => ({
  fetchProductById: jest.fn(() => ({ type: "FETCH_PRODUCT" })),
}));

jest.mock("host/cartSlice", () => ({
  addToCart: jest.fn(() => ({ type: "ADD_TO_CART" })),
}));

// ✅ Mock react-router
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// ✅ Minimal reducer
const reducer = (state) => state;

// ✅ Helper render function
const renderWithStore = (state) =>
  render(
    <Provider store={createStore(reducer, state)}>
      <BrowserRouter>
        <ProductDetail />
      </BrowserRouter>
    </Provider>
  );

// ✅ Mock product data
const mockProduct = {
  id: "1",
  name: "Luxury Watch",
  rating: 4.5,
  offerPrice: 2500,
  originalPrice: 3000,
  offers: "10% off",
  description: "A stylish luxury watch.",
  images: ["watch1.jpg"],
};

describe("🛍️ ProductDetail - Buy Now & Checkout Flow", () => {
  beforeEach(() => jest.clearAllMocks());

  // 1️⃣ Buy Now without login
  test("Shows login prompt when Buy Now is clicked without user login", () => {
    renderWithStore({
      auth: { user: null },
      products: { selected: mockProduct },
    });

    fireEvent.click(screen.getByRole("button", { name: /buy now/i }));
    expect(screen.getByText(/please login to buy/i)).toBeInTheDocument();
  });

  // 2️⃣ Logged-in user opens checkout
  test("Opens checkout popup for logged-in user", () => {
    renderWithStore({
      auth: { user: { id: 1, username: "John", email: "john@example.com" } },
      products: { selected: mockProduct },
    });

    fireEvent.click(screen.getByRole("button", { name: /buy now/i }));
    expect(screen.getByText(/checkout/i)).toBeInTheDocument();
  });

  // 3️⃣ Prefilled user info in checkout
  test("Checkout form pre-fills logged-in user info", () => {
    const user = {
      id: 1,
      username: "John Doe",
      email: "john@example.com",
      address: "123 Main St",
      phone: "9876543210",
    };

    renderWithStore({
      auth: { user },
      products: { selected: mockProduct },
    });

    fireEvent.click(screen.getByRole("button", { name: /buy now/i }));

    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123 Main St")).toBeInTheDocument();
    expect(screen.getByDisplayValue("9876543210")).toBeInTheDocument();
  });

  // 4️⃣ Change payment method
  test("User can change payment method in checkout", () => {
    renderWithStore({
      auth: { user: { id: 1, username: "John" } },
      products: { selected: mockProduct },
    });

    fireEvent.click(screen.getByRole("button", { name: /buy now/i }));

    const paymentSelect = screen.getByRole("combobox");
    fireEvent.change(paymentSelect, { target: { value: "Cash on Delivery" } });
    expect(paymentSelect.value).toBe("Cash on Delivery");

  });

  // 5️⃣ Cancel button closes checkout
  test("Closes checkout popup when Cancel is clicked", () => {
    renderWithStore({
      auth: { user: { id: 1, username: "John" } },
      products: { selected: mockProduct },
    });

    fireEvent.click(screen.getByRole("button", { name: /buy now/i }));

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText(/checkout/i)).not.toBeInTheDocument();
  });
});
