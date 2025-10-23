export const addToCart = jest.fn((product) => ({ type: "ADD_TO_CART", payload: product }));
export const updateCartQuantity = jest.fn((id, qty) => ({ type: "UPDATE_QTY", payload: { id, qty } }));
export const removeFromCart = jest.fn((id) => ({ type: "REMOVE_FROM_CART", payload: id }));
