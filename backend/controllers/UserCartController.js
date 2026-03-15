const Cart = require("../models/CartItemModel");
const MenuItem = require("../models/MenuItem");

const buildCartKey = (item) => {
    if (item.cartKey) {
        return item.cartKey;
    }

    const extras = [...(item.customization?.extras || [])].sort().join("|");
    const size = item.customization?.size || "Small";
    const crust = item.customization?.crust || "Thin";

    return [item.itemId, size, crust, extras].join("::");
};

const getReservedQuantity = (cartItems, itemId, excludedKey = null) =>
    cartItems.reduce((sum, item) => {
        const sameItem = item.itemId.toString() === itemId.toString();
        const sameKey = (item.cartKey || item.itemId.toString()) === excludedKey;

        if (!sameItem || sameKey) {
            return sum;
        }

        return sum + (item.quantity || 0);
    }, 0);

exports.addToCart = async (req, res) => {
    try {
        const { userId, items } = req.body;
        const newItem = {
            ...items[0],
            cartKey: buildCartKey(items[0]),
            customization: {
                size: items[0]?.customization?.size || "Small",
                crust: items[0]?.customization?.crust || "Thin",
                extras: items[0]?.customization?.extras || [],
            },
        };
        const menuItem = await MenuItem.findById(newItem.itemId);

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        if (!menuItem.isAvailable || menuItem.stock <= 0) {
            return res.status(400).json({ message: `${menuItem.name} is out of stock` });
        }

        let cart = await Cart.findOne({ userId });

        if (cart) {
            const existingItem = cart.items.find(
                (i) => (i.cartKey || i.itemId.toString()) === newItem.cartKey
            );
            const reservedQuantity = getReservedQuantity(
                cart.items,
                newItem.itemId,
                existingItem ? newItem.cartKey : null
            );
            const nextQuantity = (existingItem?.quantity || 0) + (newItem.quantity || 1);

            if (reservedQuantity + nextQuantity > menuItem.stock) {
                return res.status(400).json({
                    message: `Only ${menuItem.stock} ${menuItem.name} available in stock`,
                });
            }

            if (existingItem) {
                existingItem.quantity += newItem.quantity || 1;
            } else {
                cart.items.push(newItem);
            }

            cart.totalAmount = cart.items.reduce(
                (sum, i) => sum + i.price * i.quantity,
                0
            );

            await cart.save();
        } else {
            cart = await Cart.create({
                userId,
                items: [newItem],
                totalAmount: newItem.price * (newItem.quantity || 1),
            });
        }

        res.status(201).json({ message: "Item added to cart", cartItem: cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        res.json(cart ? cart.items : []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const { userId, itemId } = req.params;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(
            (i) => (i.cartKey || i.itemId.toString()) !== itemId
        );
        cart.totalAmount = cart.items.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
        );

        await cart.save();
        res.json({ message: "Item removed from cart", items: cart.items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCartQuantity = async (req, res) => {
    try {
        const { userId, itemId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(
                (i) => (i.cartKey || i.itemId.toString()) !== itemId
            );
        } else {
            const item = cart.items.find(
                (i) => (i.cartKey || i.itemId.toString()) === itemId
            );
            if (item) {
                const menuItem = await MenuItem.findById(item.itemId);

                if (!menuItem || !menuItem.isAvailable || menuItem.stock <= 0) {
                    return res.status(400).json({ message: `${item.name} is out of stock` });
                }

                const reservedQuantity = getReservedQuantity(
                    cart.items,
                    item.itemId,
                    itemId
                );

                if (reservedQuantity + quantity > menuItem.stock) {
                    return res.status(400).json({
                        message: `Only ${menuItem.stock} ${item.name} available in stock`,
                    });
                }

                item.quantity = quantity;
            } else {
                return res.status(404).json({ message: "Item not found in cart" });
            }
        }

        cart.totalAmount = cart.items.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
        );

        await cart.save();
        res.json({ message: "Cart updated", items: cart.items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.params.userId });
        res.json({ message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
