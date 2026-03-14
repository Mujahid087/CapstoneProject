const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },

    description: String,

    price: {
        type: Number,
        required: true
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },

    image: String,

    isAvailable: {
        type: Boolean,
        default: true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);