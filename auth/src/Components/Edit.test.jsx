import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { BrowserRouter } from "react-router-dom";
import EditProfile from "../EditProfile";
import { updateUser } from "host/authSlice";

jest.mock("host/authSlice", () => ({
  updateUser: jest.fn(),
}));

const mockStore = configureStore([]);

function renderWithStore(initialState) {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <EditProfile />
      </BrowserRouter>
    </Provider>
  );
}

describe("EditProfile Component", () => {
  const initialUser = {
    id: 1,
    username: "JohnDoe",
    email: "john@example.com",
    phone: "1234567890",
    address: "123 Street",
  };

  test("renders form with pre-filled user data", () => {
    renderWithStore({ auth: { user: initialUser } });

    expect(screen.getByDisplayValue("JohnDoe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1234567890")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123 Street")).toBeInTheDocument();
  });

  test("shows error when username is empty", async () => {
    renderWithStore({ auth: { user: initialUser } });

    const usernameInput = screen.getByDisplayValue("JohnDoe");
    fireEvent.change(usernameInput, { target: { value: "" } });

    fireEvent.click(screen.getByText("Update Profile"));

    expect(await screen.findByText("Username is required")).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  test("shows error when email is invalid", async () => {
    renderWithStore({ auth: { user: initialUser } });

    const emailInput = screen.getByDisplayValue("john@example.com");
    // remove readOnly temporarily for test
    emailInput.removeAttribute("readOnly");
    fireEvent.change(emailInput, { target: { value: "wrongemail" } });

    fireEvent.click(screen.getByText("Update Profile"));

    expect(await screen.findByText("Invalid email format")).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  test("shows error when phone is invalid", async () => {
    renderWithStore({ auth: { user: initialUser } });

    const phoneInput = screen.getByDisplayValue("1234567890");
    fireEvent.change(phoneInput, { target: { value: "123" } });

    fireEvent.click(screen.getByText("Update Profile"));

    expect(
      await screen.findByText("Phone number must be 10 digits")
    ).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  test("shows error when address is empty", async () => {
    renderWithStore({ auth: { user: initialUser } });

    const addressInput = screen.getByDisplayValue("123 Street");
    fireEvent.change(addressInput, { target: { value: "" } });

    fireEvent.click(screen.getByText("Update Profile"));

    expect(await screen.findByText("Address is required")).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  test("submits valid form and dispatches updateUser", async () => {
    renderWithStore({ auth: { user: initialUser } });

    fireEvent.change(screen.getByDisplayValue("JohnDoe"), {
      target: { value: "JaneDoe" },
    });

    fireEvent.click(screen.getByText("Update Profile"));

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith({
        ...initialUser,
        username: "JaneDoe",
      });
    });
  });
});
