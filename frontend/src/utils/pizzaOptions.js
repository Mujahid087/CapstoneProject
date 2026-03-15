export const PIZZA_SIZES = [
  { label: "Small", priceDelta: 0 },
  { label: "Medium", priceDelta: 50 },
  { label: "Large", priceDelta: 100 },
];

export const PIZZA_CRUSTS = [
  { label: "Thin", priceDelta: 0 },
  { label: "Cheese Burst", priceDelta: 70 },
];

export const PIZZA_EXTRAS = [
  { label: "Olives", priceDelta: 30 },
  { label: "Jalapenos", priceDelta: 25 },
  { label: "Extra Cheese", priceDelta: 40 },
];

export const DEFAULT_CUSTOMIZATION = {
  size: "Small",
  crust: "Thin",
  extras: [],
};

const getDelta = (options, label) =>
  options.find((option) => option.label === label)?.priceDelta || 0;

export function calculateCustomizedPrice(basePrice, customization = DEFAULT_CUSTOMIZATION) {
  const extrasTotal = (customization.extras || []).reduce(
    (sum, extra) => sum + getDelta(PIZZA_EXTRAS, extra),
    0
  );

  return (
    Number(basePrice || 0) +
    getDelta(PIZZA_SIZES, customization.size) +
    getDelta(PIZZA_CRUSTS, customization.crust) +
    extrasTotal
  );
}

export function buildCartKey(itemId, customization = DEFAULT_CUSTOMIZATION) {
  const extras = [...(customization.extras || [])].sort().join("|");
  return [
    itemId,
    customization.size || DEFAULT_CUSTOMIZATION.size,
    customization.crust || DEFAULT_CUSTOMIZATION.crust,
    extras,
  ].join("::");
}

export function createCustomizedCartItem(item, customization) {
  const normalizedCustomization = {
    size: customization.size || DEFAULT_CUSTOMIZATION.size,
    crust: customization.crust || DEFAULT_CUSTOMIZATION.crust,
    extras: [...(customization.extras || [])].sort(),
  };

  return {
    itemId: item._id || item.itemId,
    cartKey: buildCartKey(item._id || item.itemId, normalizedCustomization),
    name: item.name,
    price: calculateCustomizedPrice(item.price, normalizedCustomization),
    quantity: 1,
    customization: normalizedCustomization,
  };
}

export function createSimpleCartItem(item) {
  return {
    itemId: item._id || item.itemId,
    cartKey: item.cartKey || String(item._id || item.itemId),
    name: item.name,
    price: Number(item.price || 0),
    quantity: 1,
    customization: item.customization || null,
  };
}

export function isPizzaCategory(categoryName = "") {
  return categoryName.trim().toLowerCase() === "pizza";
}

export function formatCustomization(customization = DEFAULT_CUSTOMIZATION) {
  if (!customization) {
    return "Standard item";
  }

  const extras = customization.extras?.length
    ? customization.extras.join(", ")
    : "No extras";

  return `${customization.size || DEFAULT_CUSTOMIZATION.size} | ${customization.crust || DEFAULT_CUSTOMIZATION.crust} | ${extras}`;
}
