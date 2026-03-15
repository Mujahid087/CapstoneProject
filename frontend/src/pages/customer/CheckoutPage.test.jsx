import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CheckoutPage from "./CheckoutPage";

const mockNavigate = jest.fn();
const mockPlaceOrder = jest.fn((payload) => async () => ({
  meta: { requestStatus: "fulfilled" },
  payload,
}));
const mockClearCart = jest.fn((userId) => ({ type: "cart/clearCart", payload: userId }));
const mockGetUserAddresses = jest.fn((userId) => async () => ({
  meta: { requestStatus: "fulfilled" },
  payload: userId,
}));
const mockAddAddress = jest.fn((payload) => async () => ({
  meta: { requestStatus: "fulfilled" },
  payload: { _id: "addr-new", ...payload },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../redux/orderSlice", () => ({
  placeOrder: (payload) => mockPlaceOrder(payload),
}));

jest.mock("../../redux/cartSlice", () => ({
  clearCart: (userId) => mockClearCart(userId),
}));

jest.mock("../../redux/userSlice", () => ({
  getUserAddresses: (userId) => mockGetUserAddresses(userId),
  addAddress: (payload) => mockAddAddress(payload),
}));

jest.mock("../../components/Loader", () => function Loader() {
  return <div>Loading...</div>;
});

function createStore(overrides = {}) {
  return configureStore({
    reducer: {
      user: (
        state = {
          addresses: [],
          loading: false,
          ...overrides.user,
        }
      ) => state,
      cart: (
        state = {
          items: [
            {
              itemId: "pizza-1",
              cartKey: "pizza-1::Small::Thin::",
              name: "Margherita",
              price: 200,
              quantity: 1,
              customization: { size: "Small", crust: "Thin", extras: [] },
            },
          ],
          ...overrides.cart,
        }
      ) => state,
      auth: (
        state = {
          user: { id: "user-1" },
          ...overrides.auth,
        }
      ) => state,
      order: (
        state = {
          loading: false,
          ...overrides.order,
        }
      ) => state,
    },
  });
}

function renderCheckout(overrides = {}) {
  const store = createStore(overrides);
  const view = render(
    <Provider store={store}>
      <CheckoutPage />
    </Provider>
  );

  return { store, ...view };
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockPlaceOrder.mockClear();
    mockClearCart.mockClear();
    mockGetUserAddresses.mockClear();
    mockAddAddress.mockClear();
  });

  it("shows delivery addresses by default and requires one before placing a delivery order", () => {
    renderCheckout();

    expect(screen.getByText(/Select Delivery Address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Place Order/i })).toBeDisabled();
    expect(mockGetUserAddresses).toHaveBeenCalledWith("user-1");
  });

  it("hides the address section for pickup and allows placing order without addressId", async () => {
    const user = userEvent.setup();
    renderCheckout();

    await user.selectOptions(screen.getByRole("combobox"), "pickup");

    expect(screen.queryByText(/Select Delivery Address/i)).not.toBeInTheDocument();
    expect(screen.getByText(/No delivery address is required for pickup orders/i)).toBeInTheDocument();

    const placeOrderButton = screen.getByRole("button", { name: /Place Order/i });
    expect(placeOrderButton).toBeEnabled();

    await user.click(placeOrderButton);

    expect(mockPlaceOrder).toHaveBeenCalledWith({
      userId: "user-1",
      items: [
        {
          itemId: "pizza-1",
          cartKey: "pizza-1::Small::Thin::",
          name: "Margherita",
          price: 200,
          quantity: 1,
          customization: { size: "Small", crust: "Thin", extras: [] },
        },
      ],
      totalAmount: 210,
      deliveryMode: "pickup",
    });
    expect(mockClearCart).toHaveBeenCalledWith("user-1");
    expect(mockNavigate).toHaveBeenCalledWith("/orders");
  });

  it("includes the selected address when placing a delivery order", async () => {
    const user = userEvent.setup();

    renderCheckout({
      user: {
        addresses: [
          {
            _id: "addr-1",
            label: "Home",
            houseNumber: "12A",
            street: "Main Road",
            city: "Kolkata",
            state: "WB",
            pincode: "700001",
            isDefault: true,
          },
        ],
      },
    });

    const placeOrderButton = screen.getByRole("button", { name: /Place Order/i });
    expect(placeOrderButton).toBeEnabled();

    await user.click(placeOrderButton);

    expect(mockPlaceOrder).toHaveBeenCalledWith({
      userId: "user-1",
      addressId: "addr-1",
      items: [
        {
          itemId: "pizza-1",
          cartKey: "pizza-1::Small::Thin::",
          name: "Margherita",
          price: 200,
          quantity: 1,
          customization: { size: "Small", crust: "Thin", extras: [] },
        },
      ],
      totalAmount: 260,
      deliveryMode: "delivery",
    });
    expect(mockClearCart).toHaveBeenCalledWith("user-1");
    expect(mockNavigate).toHaveBeenCalledWith("/orders");
  });
});
