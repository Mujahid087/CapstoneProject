const mongoose = require("mongoose");

const customizationSchema = new mongoose.Schema(
    {
        size: {
            type: String,
            default: "Small"
        },
        crust: {
            type: String,
            default: "Thin"
        },
        extras: {
            type: [String],
            default: []
        }
    },
    { _id: false }
);

const orderItemSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem"
    },
    cartKey: String,
    name: String,
    price: Number,
    quantity: Number,
    customization: {
        type: customizationSchema,
        default: () => ({})
    }
});

const orderSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true
    },

    items: [orderItemSchema],

    totalPrice: Number, 
    discount: {
        type: Number,
        default: 0 
    },
    discountAmount: {
        type: Number,
        default: 0 
    },
    finalPrice: Number, 


    orderStatus: {
        type: String,
        enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
        default: "pending"
    },

    deliveryMode: {
        type: String,
        enum: ["delivery", "pickup"],
        default: "delivery"
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
