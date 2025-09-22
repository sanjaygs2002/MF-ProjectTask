// host/src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 🔹 Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await fetch("http://localhost:5000/users");
      const users = await res.json();
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        return thunkAPI.rejectWithValue("Invalid email or password");
      }

      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (err) {
      return thunkAPI.rejectWithValue("Login failed");
    }
  }
);

// 🔹 Async thunk for register
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ username, email, password, phone, address }, thunkAPI) => {
    try {
      const res = await fetch("http://localhost:5000/users");
      const users = await res.json();

      // ✅ Check if user already exists
      if (users.find((u) => u.email === email)) {
        return thunkAPI.rejectWithValue("User already exists");
      }

      // ✅ Add phone and address fields
      const newUser = { 
        username, 
        email, 
        password, 
        phone, 
        address, 
        cart: [], 
        orders: [] 
      };

      await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    } catch (err) {
      return thunkAPI.rejectWithValue("Signup failed");
    }
  }
);


const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
