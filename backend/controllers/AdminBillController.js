const Order = require("../models/OrderModel");
const User = require("../models/User");
const Payment = require("../models/PaymentModel");

exports.generateBill = async (req, res) => {
    try {

        const order = await Order.findById(req.params.orderId)
            .populate("userId")
            .populate("addressId");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const payment = await Payment.findOne({ orderId: order._id });

        const bill = {
            orderId: order._id,
            customer: order.userId.name,
            email: order.userId.email,
            phone: order.userId.phone,
            items: order.items,
            totalAmount: order.totalAmount,
            status: order.orderStatus,
            deliveryMode: order.deliveryMode,
            createdAt: order.createdAt,
            address: order.addressId
                ? {
                      houseNumber: order.addressId.houseNumber,
                      street: order.addressId.street,
                      city: order.addressId.city,
                      state: order.addressId.state,
                      pincode: order.addressId.pincode,
                      landmark: order.addressId.landmark,
                  }
                : null,
            payment: payment
                ? {
                      paymentMode: payment.paymentMode,
                      paymentStatus: payment.paymentStatus,
                      paidAmount: payment.paidAmount,
                      transactionId: payment.transactionId,
                      paidAt: payment.paidAt,
                  }
                : null,
        };

        res.json(bill);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};