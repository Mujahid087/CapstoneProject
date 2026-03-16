const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String
    },

    role: {
        type: String,
        enum: ["admin", "customer"],
        default: "customer"
    },

    otp: {
        type: String,
        default: null
    },

    otpExpires: {
        type: Date,
        default: null
    },

    resetPasswordToken: {
        type: String,
        default: null
    },

    resetPasswordExpires: {
        type: Date,
        default: null
    },

    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem"
    }]
},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
