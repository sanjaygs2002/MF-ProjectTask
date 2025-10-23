export const fetchProducts = jest.fn(() => ({ type: "FETCH_PRODUCTS" }));
export const mockProducts = [
  { id: 1, name: "Mock Watch", price: 1000 },
  { id: 2, name: "Test Watch", price: 2000 },
];
