const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Register
exports.registerUser = async (req, res) => {
try {

    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role: "customer"
    });

    res.status(201).json({
        message: "User registered successfully",
        user
    });

} catch (error) {

    res.status(500).json({ message: error.message });

}
};


exports.updateProfile = async (req, res) => {
try {

    const { name, email, phone, password } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
    }

    await user.save();

    res.json({
        message: "Profile updated successfully",
        user
    });

} catch (error) {

    res.status(500).json({
        message: error.message
    });

}
};



// Login
exports.loginUser = async (req, res) => {

try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.json({
        message: "Login successful",
        token
    });

} catch (error) {

    res.status(500).json({ message: error.message });

}
};


exports.getProfile = async (req, res) => {

const user = await User.findById(req.user.id).select("-password");

res.json(user);

};



// Logout
exports.logoutUser = async (req, res) => {

    res.json({
        message: "User logged out successfully"
    });

};