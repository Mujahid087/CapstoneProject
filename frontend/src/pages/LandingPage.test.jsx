import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import LandingPage from "./LandingPage";

// Mock socket.io-client to prevent connection attempts
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

function createMockStore(overrides = {}) {
  return configureStore({
    reducer: {
      auth: (state = { loading: false, error: null, token: null, user: null, role: null, ...overrides }) => state,
      menu: (state = {
        categories: [
          { _id: "cat1", categoryName: "Pizza" },
          { _id: "cat2", categoryName: "Beverages" },
        ],
        menuItems: [
          { _id: "item1", name: "Margherita", price: 299, description: "Classic pizza", isAvailable: true, image: "" },
          { _id: "item2", name: "Pepperoni", price: 399, description: "Spicy pepperoni", isAvailable: true, image: "" },
        ],
        loading: false,
        error: null,
      }) => state,
      cart: (state = { items: [], loading: false }) => state,
      user: (state = { messages: [] }) => state,
    },
  });
}

function renderLandingPage(storeOverrides = {}) {
  const store = createMockStore(storeOverrides);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("LandingPage", () => {
  it("renders the hero section with welcome message", () => {
    renderLandingPage();

    expect(screen.getByText(/Welcome to PizzaHub/i)).toBeInTheDocument();
    expect(screen.getByText(/Freshly baked pizzas/i)).toBeInTheDocument();
  });

  it("renders the navbar with Login and Register buttons when not logged in", () => {
    renderLandingPage();

    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("renders category navigation pills", () => {
    renderLandingPage();

    expect(screen.getByText("Pizza")).toBeInTheDocument();
    expect(screen.getByText("Beverages")).toBeInTheDocument();
  });

  it("renders menu items with name and price", () => {
    renderLandingPage();

    expect(screen.getByText("Margherita")).toBeInTheDocument();
    expect(screen.getByText("₹299")).toBeInTheDocument();
    expect(screen.getByText("Pepperoni")).toBeInTheDocument();
    expect(screen.getByText("₹399")).toBeInTheDocument();
  });

  it("renders Add to Cart buttons for available items", () => {
    renderLandingPage();

    const addButtons = screen.getAllByRole("button", { name: /add to cart/i });
    expect(addButtons.length).toBe(2);
  });

  it("renders Our Menu heading", () => {
    renderLandingPage();

    const menuHeadings = screen.getAllByText(/Our Menu/i);
    expect(menuHeadings.length).toBeGreaterThanOrEqual(1);
  });
});
