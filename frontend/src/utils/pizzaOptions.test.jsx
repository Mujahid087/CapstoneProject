import {
  DEFAULT_CUSTOMIZATION,
  buildCartKey,
  calculateCustomizedPrice,
  createCustomizedCartItem,
  createSimpleCartItem,
  formatCustomization,
  isPizzaCategory,
} from "./pizzaOptions";

describe("pizzaOptions utilities", () => {
  it("calculates live price using size, crust, and extras", () => {
    const total = calculateCustomizedPrice(200, {
      size: "Medium",
      crust: "Cheese Burst",
      extras: ["Extra Cheese", "Olives"],
    });

    expect(total).toBe(390);
  });

  it("builds stable cart keys regardless of extras order", () => {
    const keyA = buildCartKey("item-1", {
      size: "Large",
      crust: "Thin",
      extras: ["Olives", "Jalapenos"],
    });
    const keyB = buildCartKey("item-1", {
      size: "Large",
      crust: "Thin",
      extras: ["Jalapenos", "Olives"],
    });

    expect(keyA).toBe(keyB);
  });

  it("creates a customized cart item with normalized customization and calculated price", () => {
    const cartItem = createCustomizedCartItem(
      { _id: "pizza-1", name: "Farmhouse", price: 250 },
      { size: "Medium", crust: "Thin", extras: ["Extra Cheese"] }
    );

    expect(cartItem).toEqual({
      itemId: "pizza-1",
      cartKey: "pizza-1::Medium::Thin::Extra Cheese",
      name: "Farmhouse",
      price: 340,
      quantity: 1,
      customization: {
        size: "Medium",
        crust: "Thin",
        extras: ["Extra Cheese"],
      },
    });
  });

  it("creates a simple cart item for non-pizza products", () => {
    expect(
      createSimpleCartItem({ _id: "drink-1", name: "Pepsi", price: 90 })
    ).toEqual({
      itemId: "drink-1",
      cartKey: "drink-1",
      name: "Pepsi",
      price: 90,
      quantity: 1,
      customization: null,
    });
  });

  it("detects pizza categories and formats customization details", () => {
    expect(isPizzaCategory(" Pizza ")).toBe(true);
    expect(isPizzaCategory("Beverages")).toBe(false);
    expect(formatCustomization(DEFAULT_CUSTOMIZATION)).toBe("Small | Thin | No extras");
  });
});
