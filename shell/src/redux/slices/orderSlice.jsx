import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch orders for a user
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:5000/users/${userId}`);
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      return data.orders || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Place order from cart
export const placeOrderFromCart = createAsyncThunk(
  "orders/placeOrderFromCart",
  async ({ userId, cartItems, userInfo }, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:5000/users/${userId}`);
      const user = await res.json();

      const newOrder = {
        id: Date.now().toString(),
        items: cartItems,
        userInfo,
        date: new Date().toISOString(),
        status: "Placed",
      };

      const updatedOrders = [...(user.orders || []), newOrder];

      await fetch(`http://localhost:5000/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: updatedOrders, cart: [] }),
      });

      return newOrder;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Place order directly (Buy Now)
export const placeOrderDirect = createAsyncThunk(
  "orders/placeOrderDirect",
  async ({ userId, userInfo, product }, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:5000/users/${userId}`);
      const user = await res.json();
      if (!user) throw new Error("User not found");

      const newOrder = {
        id: Date.now().toString(),
        items: [{ ...product, quantity: 1 }],
        userInfo,
        date: new Date().toISOString(),
        status: "Placed",
      };

      const updatedOrders = [...(user.orders || []), newOrder];

      await fetch(`http://localhost:5000/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: updatedOrders }),
      });

      return newOrder;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cancel order (till Confirmed stage only)
export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ userId, orderId }, thunkAPI) => {
    // 1️⃣ Fetch the user to get their orders
    const userRes = await fetch(`http://localhost:5000/users/${userId}`);
    const userData = await userRes.json();

    // 2️⃣ Find the order to update
    const updatedOrders = userData.orders.map((order) =>
      order.id === orderId ? { ...order, status: "Cancelled" } : order
    );

    // 3️⃣ Update the user’s orders list
    const response = await fetch(`http://localhost:5000/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: updatedOrders }),
    });

    const updatedUser = await response.json();

    // 4️⃣ Return updated order only for Redux
    const updatedOrder = updatedUser.orders.find((o) => o.id === orderId);
    return updatedOrder;
  }
);


const orderSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.status = "loading"; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(placeOrderFromCart.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(placeOrderDirect.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(cancelOrder.fulfilled, (state, action) => {
  const updatedOrder = action.payload;
  state.items = state.items.map((order) =>
    order.id === updatedOrder.id ? updatedOrder : order
  );
});


  },
});

export default orderSlice.reducer;
