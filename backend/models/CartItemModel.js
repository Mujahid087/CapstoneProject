const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem"
    },
    name: String,
    price: Number,
    quantity: Number
});

const cartSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [cartItemSchema],

    totalAmount: {
        type: Number,
        default: 0
    }
},
{ timestamps: { createdAt: false, updatedAt: true } }
);

module.exports = mongoose.model("Cart", cartSchema);