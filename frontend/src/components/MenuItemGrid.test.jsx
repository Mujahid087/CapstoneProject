import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import MenuItemGrid from "./MenuItemGrid";

describe("MenuItemGrid", () => {
  const items = [
    {
      _id: "pizza-1",
      categoryId: "cat-pizza",
      name: "Margherita",
      description: "Classic pizza",
      price: 299,
      isAvailable: true,
      stock: 5,
      image: "",
    },
    {
      _id: "drink-1",
      categoryId: "cat-drink",
      name: "Pepsi",
      description: "Cold drink",
      price: 99,
      isAvailable: true,
      stock: 10,
      image: "",
    },
    {
      _id: "pizza-2",
      categoryId: "cat-pizza",
      name: "Sold Out Pizza",
      description: "Unavailable",
      price: 350,
      isAvailable: true,
      stock: 0,
      image: "",
    },
  ];

  const categoryMap = {
    "cat-pizza": "Pizza",
    "cat-drink": "Beverages",
  };

  it("shows customize for pizzas and add to cart for non-pizza items", () => {
    render(
      <MenuItemGrid
        items={items.slice(0, 2)}
        categoryMap={categoryMap}
        onItemAction={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Customize" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeInTheDocument();
  });

  it("disables ordering and shows out-of-stock state when stock is zero", () => {
    render(
      <MenuItemGrid
        items={[items[2]]}
        categoryMap={categoryMap}
        onItemAction={jest.fn()}
      />
    );

    expect(screen.getAllByText("Out of Stock")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Out of Stock" })).toBeDisabled();
  });

  it("renders favorite heart only for pizza items and toggles callback", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = jest.fn();

    render(
      <MenuItemGrid
        items={items.slice(0, 2)}
        categoryMap={categoryMap}
        onItemAction={jest.fn()}
        allowFavorites
        favoriteIds={["pizza-1"]}
        onToggleFavorite={onToggleFavorite}
      />
    );

    const buttons = screen.getAllByRole("button");
    const favoriteButtons = buttons.filter((button) =>
      button.className.includes("rounded-circle")
    );

    expect(favoriteButtons).toHaveLength(1);

    await user.click(favoriteButtons[0]);
    expect(onToggleFavorite).toHaveBeenCalledWith(items[0]);
  });
});
