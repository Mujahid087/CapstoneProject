const Cart = require("../models/CartItemModel");

exports.addToCart = async (req, res) => {
    try {
        const { userId, items } = req.body;
        const newItem = items[0];

        let cart = await Cart.findOne({ userId });

        if (cart) {
            const existingItem = cart.items.find(
                (i) => i.itemId.toString() === newItem.itemId
            );

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

        cart.items = cart.items.filter((i) => i.itemId.toString() !== itemId);
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
            cart.items = cart.items.filter((i) => i.itemId.toString() !== itemId);
        } else {
            const item = cart.items.find((i) => i.itemId.toString() === itemId);
            if (item) {
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