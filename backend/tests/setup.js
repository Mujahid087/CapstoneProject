const mongoose = require("mongoose");
require("dotenv").config();

before(async function() {
    this.timeout(15000);
    console.log("--- TEST SETUP START ---");
    if (mongoose.connection.readyState === 0) {
        try {
            console.log("Connecting to MongoDB for tests...");
            await mongoose.connect(process.env.MONGO_URI);
            console.log("✅ MongoDB Connected for Tests");
        } catch (err) {
            console.error("❌ MongoDB Connection Error in Tests:", err.message);
            throw err;
        }
    }
    console.log("--- TEST SETUP END ---");
});

after(async () => {
    // await mongoose.connection.close(); // Keep open if multiple files run sequentially
});
