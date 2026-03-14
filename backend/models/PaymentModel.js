const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
{
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    paymentMode: {
        type: String,
        enum: ["card", "upi", "cash"]
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"]
    },

    paidAmount: Number,

    transactionId: String,

    paidAt: Date
}
);

module.exports = mongoose.model("Payment", paymentSchema);