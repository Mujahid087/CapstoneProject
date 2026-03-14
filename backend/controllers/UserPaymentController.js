const Payment = require("../models/PaymentModel");
const Order = require("../models/OrderModel");
const AdminNotification = require("../models/AdminNotificationModel");

// Make payment
exports.makePayment = async (req, res) => {
try {
    const { orderId, paidAmount } = req.body;

    // Fetch the original order
    const order = await Order.findById(orderId);
    
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    // Server-side validation: Ensure payment amount matches exactly
    const expectedAmount = order.finalPrice || order.totalAmount || (
        order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - (order.discountAmount || 0) + (order.deliveryMode === 'delivery' ? 50 : 0) + Math.round(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.05)
    );

    if (expectedAmount !== paidAmount) {
        return res.status(400).json({ 
            message: `Amount mismatch. Expected ₹${expectedAmount}, got ₹${paidAmount}. Payment rejected for security reasons.`
        });
    }

    // Create the payment record
    const payment = await Payment.create(req.body);

    // Update the Order to mark it as Paid
    order.paymentStatus = "paid";
    await order.save();

    const notification = await AdminNotification.create({
        eventTitle: "Payment Completed",
        message: `Payment of ₹${paidAmount} received for order #${order._id.toString().slice(-6).toUpperCase()}`,
        orderId: order._id,
        userId: order.userId
    });

    const io = req.app.get('io');
    if (io) {
        io.to("admin_room").emit("new_admin_notification", notification);
    }

    res.status(201).json({
        message: "Payment successful",
        payment
    });

} catch (error) {

    res.status(500).json({ message: error.message });

}
};