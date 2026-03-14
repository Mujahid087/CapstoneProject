const Message = require("../models/MessageModel");

exports.getUserMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            userId: req.params.userId
        })
            .populate("orderId")
            .sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        ).populate("orderId");

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};