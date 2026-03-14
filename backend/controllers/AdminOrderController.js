const Order = require("../models/OrderModel");
const Message = require("../models/MessageModel");
const AdminNotification = require("../models/AdminNotificationModel");

exports.getAllOrders = async (req, res) => {
    try {

        const orders = await Order.find()
            .populate("userId")
            .populate("addressId");

        res.json(orders);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus: status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        const statusMessages = {
            confirmed: "Your order has been confirmed",
            preparing: "Your pizza is being prepared",
            out_for_delivery: "Your order is out for delivery",
            delivered: "Your order has been delivered",
            cancelled: "Your order has been cancelled"
        };

        if (statusMessages[status]) {
            const newMessage = await Message.create({
                userId: order.userId,
                orderId: order._id,
                message: statusMessages[status]
            });

            // Push notification in real-time if the user is connected
            const io = req.app.get('io');
            if(io) {
                // Ensure the exact id format is used (string mapping)
                io.to(order.userId.toString()).emit("new_notification", newMessage);

                // Admin Notification (Internal tracking for delivered events)
                if (status === "delivered") {
                    AdminNotification.create({
                        eventTitle: "Order Delivered",
                        message: `Order #${order._id.toString().slice(-6).toUpperCase()} marked as delivered`,
                        orderId: order._id,
                        userId: order.userId
                    }).then(adminNotif => {
                        io.to("admin_room").emit("new_admin_notification", adminNotif);
                    }).catch(err => console.error("Failed to create admin notification:", err));
                }
            }
        }

        res.json(order);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};