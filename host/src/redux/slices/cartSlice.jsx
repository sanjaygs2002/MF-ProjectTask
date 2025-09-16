import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ✅ Add product to user’s cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, product }) => {
    const res = await fetch(`http://localhost:5000/users/${userId}`);
    const user = await res.json();

    const updatedCart = [...user.cart, product];

    await fetch(`http://localhost:5000/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: updatedCart }),
    });

    return updatedCart;
  }
);

// ✅ Fetch cart for logged-in user
export const fetchCart = createAsyncThunk("cart/fetchCart", async (userId) => {
  const res = await fetch(`http://localhost:5000/users/${userId}`);
  const user = await res.json();
  return user.cart || [];
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // addToCart
      .addCase(addToCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default cartSlice.reducer;
