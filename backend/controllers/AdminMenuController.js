const MenuItem = require("../models/MenuItem");

exports.createMenuItem = async (req, res) => {
    try {

        const item = await MenuItem.create(req.body);

        res.status(201).json(item);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllMenuItems = async (req, res) => {
    try {

        const items = await MenuItem.find().populate("categoryId");

        res.json(items);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {

        const item = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(item);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {

        await MenuItem.findByIdAndDelete(req.params.id);

        res.json({ message: "Menu item deleted" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};