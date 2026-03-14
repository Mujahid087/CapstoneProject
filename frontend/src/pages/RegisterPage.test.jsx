import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import RegisterPage from "./RegisterPage";

function createMockStore(overrides = {}) {
  return configureStore({
    reducer: {
      auth: (state = {
        loading: false,
        error: null,
        token: null,
        user: null,
        role: null,
        successMessage: null,
        ...overrides,
      }) => state,
    },
  });
}

function renderRegisterPage(store) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("RegisterPage", () => {
  it("renders the registration form with brand", () => {
    const store = createMockStore();
    renderRegisterPage(store);

    expect(screen.getByText(/PizzaHub/i)).toBeInTheDocument();
    expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
  });

  it("renders all input fields", () => {
    const store = createMockStore();
    renderRegisterPage(store);

    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your phone number")).toBeInTheDocument();
  });

  it("renders the Create Account button", () => {
    const store = createMockStore();
    renderRegisterPage(store);

    const btn = screen.getByRole("button", { name: /create account/i });
    expect(btn).toBeInTheDocument();
  });

  it("renders link to login page", () => {
    const store = createMockStore();
    renderRegisterPage(store);

    expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute("href", "/login");
  });

  it("shows validation error for short name", async () => {
    const store = createMockStore();
    renderRegisterPage(store);

    const nameInput = screen.getByPlaceholderText("Enter your name");
    fireEvent.change(nameInput, { target: { value: "A" } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText("Name too short")).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid phone", async () => {
    const store = createMockStore();
    renderRegisterPage(store);

    const phoneInput = screen.getByPlaceholderText("Enter your phone number");
    fireEvent.change(phoneInput, { target: { value: "12345" } });
    fireEvent.blur(phoneInput);

    await waitFor(() => {
      expect(screen.getByText("Phone must be 10 digits")).toBeInTheDocument();
    });
  });

  it("shows validation error for short password", async () => {
    const store = createMockStore();
    renderRegisterPage(store);

    const pwInput = screen.getByPlaceholderText("Enter your password");
    fireEvent.change(pwInput, { target: { value: "abc" } });
    fireEvent.blur(pwInput);

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();
    });
  });

  it("displays server error from Redux state", () => {
    const store = createMockStore({ error: "User already exists" });
    renderRegisterPage(store);

    expect(screen.getByText("User already exists")).toBeInTheDocument();
  });
});
