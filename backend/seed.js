require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const ADMIN_DATA = {
  name: "Admin",
  email: "admin@gmail.com",
  password: "admin123",
  phone: "9999999999",
  role: "admin",
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existing = await User.findOne({ email: ADMIN_DATA.email });
    if (existing) {
      console.log("Admin user already exists:", existing.email);
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 10);
      const admin = await User.create({
        ...ADMIN_DATA,
        password: hashedPassword,
      });
      console.log("Admin user created successfully!");
      console.log("  Email:", admin.email);
      console.log("  Password:", ADMIN_DATA.password);
    }

    await mongoose.disconnect();
    console.log("Done.");
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
}

seed();
