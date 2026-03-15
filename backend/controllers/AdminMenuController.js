const MenuItem = require("../models/MenuItem");

exports.createMenuItem = async (req, res) => {
    try {
        const itemData = {
            ...req.body,
            stock: Math.max(0, Number(req.body.stock ?? 0)),
        };
        itemData.isAvailable = Boolean(itemData.isAvailable) && itemData.stock > 0;

        const item = await MenuItem.create(itemData);
        await item.populate("categoryId");

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
        const currentItem = await MenuItem.findById(req.params.id);

        if (!currentItem) {
            return res.status(404).json({ error: "Menu item not found" });
        }

        const updateData = { ...req.body };

        if (updateData.categoryId === undefined || updateData.categoryId === null || updateData.categoryId === "") {
            delete updateData.categoryId;
        }

        if (updateData.stock !== undefined) {
            updateData.stock = Math.max(0, Number(updateData.stock));
        }

        if (updateData.stock !== undefined || updateData.isAvailable !== undefined) {
            const nextStock = updateData.stock ?? currentItem.stock;
            const nextAvailable = updateData.isAvailable ?? currentItem.isAvailable;
            updateData.isAvailable = Boolean(nextAvailable) && nextStock > 0;
        }

        const item = await MenuItem.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate("categoryId");

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
