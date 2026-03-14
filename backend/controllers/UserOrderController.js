const Order = require("../models/OrderModel");
const AdminNotification = require("../models/AdminNotificationModel");


// Place order
exports.placeOrder = async (req, res) => {

try {
    const { items, addressId, deliveryMode, userId } = req.body;

    // 1. Calculate base total price of items
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 2. Apply discount logic
    let discount = 0;
    let discountAmount = 0;

    if (totalPrice > 1000) {
        discount = 5; // 5% discount
        discountAmount = Math.round(totalPrice * 0.05);
    }

    // 3. Optional: add delivery fee & tax if applicable (matching frontend logic)
    const deliveryFee = deliveryMode === "delivery" ? 50 : 0;
    const tax = Math.round(totalPrice * 0.05);

    // 4. Calculate final payable amount
    const finalPrice = totalPrice - discountAmount + deliveryFee + tax;

    // 5. Create order with all calculated fields
    const order = await Order.create({
        userId,
        addressId,
        items,
        deliveryMode,
        totalPrice,
        discount,
        discountAmount,
        finalPrice,
        // (Legacy fallback) Keep totalAmount populated for safety if other endpoints still rely on it temporarily
        totalAmount: finalPrice 
    });

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



// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Synchronize payment status with order cancellation
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



// Get user orders
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


// Get a single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Verify the order belongs to the user requesting it
        if (order.userId.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to view this order" });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};