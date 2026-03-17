const Order = require("../models/OrderModel");
const AdminNotification = require("../models/AdminNotificationModel");
const MenuItem = require("../models/MenuItem");
exports.placeOrder = async (req, res) => {
try {
    const { items, addressId, deliveryMode, userId } = req.body;

    if (deliveryMode === "delivery" && !addressId) {
        return res.status(400).json({ message: "Delivery address is required for delivery orders" });
    }

    const groupedQuantities = items.reduce((acc, item) => {
        const itemId = item.itemId.toString();
        acc[itemId] = (acc[itemId] || 0) + (item.quantity || 0);
        return acc;
    }, {});
    const stockItems = await MenuItem.find({
        _id: { $in: Object.keys(groupedQuantities) }
    });
    const stockMap = new Map(stockItems.map((item) => [item._id.toString(), item]));

    for (const [itemId, requestedQuantity] of Object.entries(groupedQuantities)) {
        const menuItem = stockMap.get(itemId);

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        if (!menuItem.isAvailable || menuItem.stock <= 0) {
            return res.status(400).json({ message: `${menuItem.name} is out of stock` });
        }

        if (requestedQuantity > menuItem.stock) {
            return res.status(400).json({
                message: `Only ${menuItem.stock} ${menuItem.name} available in stock`,
            });
        }
    }
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    let discountAmount = 0;

    if (totalPrice > 1000) {
        discount = 5;
        discountAmount = Math.round(totalPrice * 0.05);
    }
    const deliveryFee = deliveryMode === "delivery" ? 50 : 0;
    const tax = Math.round(totalPrice * 0.05);
    const finalPrice = totalPrice - discountAmount + deliveryFee + tax;
    const order = await Order.create({
        userId,
        addressId: deliveryMode === "delivery" ? addressId : undefined,
        items,
        deliveryMode,
        totalPrice,
        discount,
        discountAmount,
        finalPrice,

        totalAmount: finalPrice 
    });

    for (const [itemId, requestedQuantity] of Object.entries(groupedQuantities)) {
        const menuItem = stockMap.get(itemId);
        menuItem.stock = Math.max(0, menuItem.stock - requestedQuantity);
        menuItem.isAvailable = menuItem.isAvailable && menuItem.stock > 0;
        await menuItem.save();
    }

    const notification = await AdminNotification.create({
        eventTitle: "New Order",
        message: `New order placed (₹${finalPrice})`,
        orderId: order._id,
        userId: order.userId
    });

    const io = req.app.get('io');
    if (io) {
        io.to("admin_room").emit("new_admin_notification", notification);
    }

    res.status(201).json({
        message: "Order placed successfully",
        order
    });

} catch (error) {

    res.status(500).json({ message: error.message });

    }
};
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.paymentStatus === "paid") {
            order.paymentStatus = "refunded";
        }

        order.orderStatus = "cancelled";
        await order.save();

        const notification = await AdminNotification.create({
            eventTitle: "Order Cancelled",
            message: `Order #${order._id.toString().slice(-6).toUpperCase()} cancelled by user`,
            orderId: order._id,
            userId: order.userId
        });

        const io = req.app.get('io');
        if (io) {
            io.to("admin_room").emit("new_admin_notification", notification);
        }

        res.json({
            message: "Order cancelled",
            order
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUserOrders = async (req, res) => {
try {
    const orders = await Order.find({
        userId: req.params.userId
    });
    res.json(orders);
} catch (error) {
    res.status(500).json({ message: error.message });
}
};
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.userId.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to view this order" });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
