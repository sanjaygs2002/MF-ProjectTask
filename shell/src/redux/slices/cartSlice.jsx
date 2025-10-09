// src/redux/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ✅ Add product to user’s cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, product }) => {
    const res = await fetch(`http://localhost:5000/users/${userId}`);
    const user = await res.json();

    const existingItem = user.cart.find((item) => item.id === product.id);

    let updatedCart;
    if (existingItem) {
      updatedCart = user.cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...user.cart, { ...product, quantity: 1 }];
    }

    await fetch(`http://localhost:5000/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: updatedCart }),
    });

    return updatedCart;
  }
);

// ✅ Fetch cart
export const fetchCart = createAsyncThunk("cart/fetchCart", async (userId) => {
  const res = await fetch(`http://localhost:5000/users/${userId}`);
  const user = await res.json();
  return user.cart || [];
});

// ✅ Update quantity
export const updateCartQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ userId, productId, quantity }) => {
    const res = await fetch(`http://localhost:5000/users/${userId}`);
    const user = await res.json();

    const updatedCart = user.cart.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );

    await fetch(`http://localhost:5000/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: updatedCart }),
    });

    return updatedCart;
  }
);

// ✅ Remove product
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ userId, productId }) => {
    const res = await fetch(`http://localhost:5000/users/${userId}`);
    const user = await res.json();

    const updatedCart = user.cart.filter((item) => item.id !== productId);

    await fetch(`http://localhost:5000/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: updatedCart }),
    });

    return updatedCart;
  }
);

// ✅ Clear cart after placing order
export const clearCart = createAsyncThunk("cart/clearCart", async (userId) => {
  await fetch(`http://localhost:5000/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart: [] }),
  });
  return [];
});

export const placeOrder = createAsyncThunk(
  "cart/placeOrder",
  async ({ userId, userInfo, selectedItemIds }, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:5000/users/${userId}`);
      const user = await res.json();

      // Take only selected items for the order
      const itemsToOrder = user.cart.filter(item =>
        selectedItemIds.includes(item.id)
      );

      const newOrder = {
        id: Date.now(),
        userInfo,
        items: itemsToOrder,
        date: new Date().toISOString(),
        status: "Pending",
      };

      const updatedOrders = [...(user.orders || []), newOrder];

      // Keep unselected items in the cart
      const updatedCart = user.cart.filter(
        item => !selectedItemIds.includes(item.id)
      );

      await fetch(`http://localhost:5000/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: updatedOrders,
          cart: updatedCart, // ✅ only remove selected items
        }),
      });

      return newOrder;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    checkoutOpen: false, // ✅ popup state
  },
  reducers: {
    openCheckout: (state) => {
      state.checkoutOpen = true;
    },
    closeCheckout: (state) => {
      state.checkoutOpen = false;
    },
  },
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
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      // updateCartQuantity
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      // removeFromCart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      // clearCart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      })

      // placeOrder
      .addCase(placeOrder.fulfilled, (state) => {
        state.items = [];
        state.checkoutOpen = false; // ✅ close popup after order
      });
  },
});

export const { openCheckout, closeCheckout } = cartSlice.actions;
export default cartSlice.reducer;
