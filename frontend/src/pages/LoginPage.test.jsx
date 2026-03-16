import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import LoginPage from "./LoginPage";

// Create a mock auth reducer
function createMockStore(overrides = {}) {
  return configureStore({
    reducer: {
      auth: (state = { loading: false, error: null, token: null, user: null, role: null, ...overrides }) => state,
    },
  });
}

function renderLoginPage(store) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("LoginPage", () => {
  it("renders the login form with brand", () => {
    const store = createMockStore();
    renderLoginPage(store);

    expect(screen.getByText(/PizzaHub/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  it("renders the Send OTP button", () => {
    const store = createMockStore();
    renderLoginPage(store);

    const btn = screen.getByRole("button", { name: /send otp/i });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it("renders the register link", () => {
    const store = createMockStore();
    renderLoginPage(store);

    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register/i })).toHaveAttribute("href", "/register");
  });

  it("shows validation error for empty email on submit", async () => {
    const store = createMockStore();
    renderLoginPage(store);

    const btn = screen.getByRole("button", { name: /send otp/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email format", async () => {
    const store = createMockStore();
    renderLoginPage(store);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(emailInput, { target: { value: "notvalid" } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });
  });

  it("shows password required error on submit without password", async () => {
    const store = createMockStore();
    renderLoginPage(store);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const btn = screen.getByRole("button", { name: /send otp/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  it("displays server error from Redux state", () => {
    const store = createMockStore({ error: "Invalid credentials" });
    renderLoginPage(store);

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("shows loading state on button when loading", () => {
    const store = createMockStore({ loading: true });
    renderLoginPage(store);

    expect(screen.getByRole("button", { name: /sending otp/i })).toBeDisabled();
  });
});
