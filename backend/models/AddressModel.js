const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    label: {
        type: String,
        enum: ["Home", "Office", "Other"],
        default: "Home"
    },

    houseNumber: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,

    isDefault: {
        type: Boolean,
        default: false
    }
},
{ timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Address", addressSchema);