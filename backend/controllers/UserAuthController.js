const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail, sendLoginOtpEmail } = require("../services/emailService");

const OTP_EXPIRY_MINUTES = 5;

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpExpiryDate() {
    return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

function generateAuthToken(user) {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
}

async function setAndSendOtp(user) {
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = getOtpExpiryDate();
    await user.save();

    await sendLoginOtpEmail({
        to: user.email,
        username: user.name,
        otp
    });
}

// Register
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

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

        await sendWelcomeEmail({
            to: user.email,
            username: user.name
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
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

// Login - Step 1 (credentials validation + OTP send)
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.role === "admin") {
            user.otp = null;
            user.otpExpires = null;
            await user.save();

            const token = generateAuthToken(user);

            return res.json({
                message: "Login successful",
                token,
                requiresOtp: false
            });
        }

        await setAndSendOtp(user);

        res.json({
            message: "OTP sent to your registered email",
            requiresOtp: true,
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login - Step 2 (OTP verification + JWT issue)
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email });

        if (!user || !user.otp || !user.otpExpires) {
            return res.status(400).json({ message: "OTP is invalid or expired" });
        }

        const isExpired = user.otpExpires.getTime() < Date.now();

        if (isExpired) {
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        user.otp = null;
        user.otpExpires = null;
        await user.save();

        const token = generateAuthToken(user);

        res.json({
            message: "Login successful",
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await setAndSendOtp(user);

        res.json({
            message: "A new OTP has been sent to your email"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpires");

    res.json(user);
};

// Logout
exports.logoutUser = async (req, res) => {
    res.json({
        message: "User logged out successfully"
    });
};
