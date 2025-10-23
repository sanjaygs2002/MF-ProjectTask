import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import ProductList from "./ProductList";
import * as cartSlice from "host/cartSlice";

// Mock cartSlice actions
jest.mock("host/cartSlice", () => ({
  addToCart: jest.fn(),
  updateCartQuantity: jest.fn(),
  removeFromCart: jest.fn(),
}));



// Mock react-router
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// Minimal reducer for testing
const reducer = (state) => state;

// Helper render function
const renderWithStore = (state) =>
  render(<Provider store={createStore(reducer, state)}><ProductList /></Provider>);

describe("🛒 ProductList - Add to Cart", () => {
  const mockProduct = {
    id: 1,
    name: "Classic Silver Watch",
    offerPrice: 1000,
    originalPrice: 1200,
    image: "watch.jpg",
  };

  beforeEach(() => jest.clearAllMocks());

  test("Shows notification when user not logged in", async () => {
    renderWithStore({ products: { list: [mockProduct] }, auth: { user: null }, cart: { items: [] } });
    fireEvent.click(screen.getByText("Add to Cart"));
    expect(await screen.findByText(/login/i)).toBeInTheDocument();
  });

  test("Dispatches addToCart when logged in", () => {
    renderWithStore({ products: { list: [mockProduct] }, auth: { user: { id: 1 } }, cart: { items: [] } });
    fireEvent.click(screen.getByText("Add to Cart"));
    expect(cartSlice.addToCart).toHaveBeenCalled();
  });

  test("Quantity controls appear after adding product", () => {
    renderWithStore({ products: { list: [mockProduct] }, auth: { user: { id: 1 } }, cart: { items: [{ ...mockProduct, quantity: 1 }] } });
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  test("Clicking + increases quantity", () => {
    renderWithStore({ products: { list: [mockProduct] }, auth: { user: { id: 1 } }, cart: { items: [{ ...mockProduct, quantity: 1 }] } });
    fireEvent.click(screen.getByText("+"));
    expect(cartSlice.updateCartQuantity).toHaveBeenCalled();
  });

  test("Clicking - reduces quantity", () => {
    renderWithStore({ products: { list: [mockProduct] }, auth: { user: { id: 1 } }, cart: { items: [{ ...mockProduct, quantity: 2 }] } });
    fireEvent.click(screen.getByText("-"));
    expect(cartSlice.updateCartQuantity).toHaveBeenCalled();
  });

  test("Quantity 0 removes product", () => {
    renderWithStore({ products: { list: [mockProduct] }, auth: { user: { id: 1 } }, cart: { items: [{ ...mockProduct, quantity: 1 }] } });
    fireEvent.click(screen.getByText("-"));
    expect(cartSlice.removeFromCart).toHaveBeenCalled();
  });
});
