import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "..Login/";

// Fake async thunk to replace host/store:loginUser
const loginUser = createAsyncThunk("auth/loginUser", async (form, { rejectWithValue }) => {
  if (form.email === "fail@test.com") {
    return rejectWithValue("Invalid credentials");
  }
  return { id: 1, email: form.email };
});

// Fake authSlice for tests
const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
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
        state.error = action.payload || "Login failed";
      });
  },
});

// Utility: render with real store
const renderWithStore = (preloadedState) => {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState,
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/signup" element={<div>Signup Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    ),
  };
};

describe("Login Component (with configureStore)", () => {
  test("renders empty fields initially", () => {
    renderWithStore();
    expect(screen.getByPlaceholderText("Email")).toHaveValue("");
    expect(screen.getByPlaceholderText("Password")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Login" })).toBeEnabled();
  });

  test("shows error message from store", () => {
    renderWithStore({ auth: { user: null, loading: false, error: "Invalid credentials" } });
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  test("redirects if already logged in", () => {
    renderWithStore({ auth: { user: { id: 1, email: "test@test.com" }, loading: false, error: null } });
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  test("updates fields and dispatches loginUser success", async () => {
    const { store } = renderWithStore();

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "good@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      const actions = store.getActions().map((a) => a.type);
      expect(actions).toContain("auth/loginUser/pending");
      expect(actions).toContain("auth/loginUser/fulfilled");
    });

    await waitFor(() => {
      expect(screen.getByText("Home Page")).toBeInTheDocument();
    });
  });

  test("dispatches loginUser failure and shows error", async () => {
    renderWithStore();

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "fail@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  test("navigates to signup page", () => {
    renderWithStore();
    fireEvent.click(screen.getByText(/sign up/i));
    expect(screen.getByText("Signup Page")).toBeInTheDocument();
  });
});
