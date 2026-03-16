const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.adminLogin = async (req, res) => {
    try {

        const { email, password } = req.body;

        const admin = await User.findOne({ email });

        if (!admin || admin.role !== "admin") {
            return res.status(401).json({ message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Admin logged in successfully",
            token
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.adminLogout = async (req, res) => {
    res.json({ message: "Admin logged out successfully" });
};


exports.getAllUsers = async (req, res) => {
try {

    const users = await User.find({ role: "customer" });

    res.json(users);

} catch (error) {

    res.status(500).json({ message: error.message });

}
};
