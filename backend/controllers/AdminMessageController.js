const Message = require("../models/MessageModel");

exports.sendMessageToUser = async (req, res) => {
    try {

        const { userId, orderId, message } = req.body;

        const newMessage = await Message.create({
            userId,
            orderId,
            message
        });

        res.status(201).json(newMessage);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};