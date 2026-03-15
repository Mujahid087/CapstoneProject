import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import PizzaCustomizationModal from "./PizzaCustomizationModal";

describe("PizzaCustomizationModal", () => {
  const item = { _id: "pizza-1", name: "Margherita", price: 200 };

  it("updates the final price as customization changes", async () => {
    const user = userEvent.setup();

    render(
      <PizzaCustomizationModal item={item} show onHide={jest.fn()} onConfirm={jest.fn()} />
    );

    expect(screen.getByText("Final Rs.200")).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Medium/i));
    await user.click(screen.getByLabelText(/Extra Cheese/i));

    expect(screen.getByText("Final Rs.290")).toBeInTheDocument();
    expect(screen.getByText("Live total")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Extra Cheese")).toBeInTheDocument();
  });

  it("sends the customized cart payload when confirmed", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const onHide = jest.fn();

    render(
      <PizzaCustomizationModal item={item} show onHide={onHide} onConfirm={onConfirm} />
    );

    await user.click(screen.getByLabelText(/Large/i));
    await user.click(screen.getByLabelText(/Cheese Burst/i));
    await user.click(screen.getByLabelText(/Olives/i));
    await user.click(screen.getByRole("button", { name: /Add to Cart/i }));

    expect(onConfirm).toHaveBeenCalledWith({
      itemId: "pizza-1",
      cartKey: "pizza-1::Large::Cheese Burst::Olives",
      name: "Margherita",
      price: 400,
      quantity: 1,
      customization: {
        size: "Large",
        crust: "Cheese Burst",
        extras: ["Olives"],
      },
    });
    expect(onHide).toHaveBeenCalled();
  });
});
