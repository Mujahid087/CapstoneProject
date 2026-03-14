// Cleanup script — remove test data from DB
require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../models/OrderModel");
const Cart = require("../models/CartItemModel");
const User = require("../models/User");

async function cleanup() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // Delete orders with "Test Pizza" items (created by tests)
    const orderResult = await Order.deleteMany({ "items.name": "Test Pizza" });
    console.log(`Deleted ${orderResult.deletedCount} test orders`);

    // Delete test cart items
    const cartResult = await Cart.deleteMany({ "items.name": "Test Pizza" });
    console.log(`Deleted ${cartResult.deletedCount} test carts`);

    // Delete test users created by auth tests
    const userResult = await User.deleteMany({ email: { $in: ["authtest@example.com", "debug_test_999@example.com"] } });
    console.log(`Deleted ${userResult.deletedCount} test users`);

    await mongoose.connection.close();
    console.log("✅ Cleanup complete!");
}

cleanup().catch(err => { console.error(err); process.exit(1); });
