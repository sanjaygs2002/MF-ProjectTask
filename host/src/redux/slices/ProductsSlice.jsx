import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch products
export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
  const response = await fetch("http://localhost:5000/products");
  return await response.json();
});

export const fetchProductById = createAsyncThunk("products/fetchProductById", async (id) => {
  const response = await fetch(`http://localhost:5000/products/${id}`);
  return await response.json();
});

const productsSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
    selected: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // fetch product by id
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selected = action.payload;
      });
  },
});

export default productsSlice.reducer;
