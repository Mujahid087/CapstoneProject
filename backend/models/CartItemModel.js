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

const cartItemSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem"
    },
    cartKey: {
        type: String,
        required: true
    },
    name: String,
    price: Number,
    quantity: Number,
    customization: {
        type: customizationSchema,
        default: () => ({})
    }
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
