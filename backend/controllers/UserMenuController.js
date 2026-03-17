const Category = require("../models/CategoryModel");
const MenuItem = require("../models/MenuItem");
exports.getCategories = async (req, res) => {
try {
    const categories = await Category.find();
    res.json(categories);
} catch (error) {
    res.status(500).json({ message: error.message });
}
};
exports.getMenuByCategory = async (req, res) => {
try {
    const items = await MenuItem.find({
        categoryId: req.params.categoryId
    });
    res.json(items);
} catch (error) {
    res.status(500).json({ message: error.message });
}
};

exports.getAllMenuItems = async (req, res) => {
    try {
        const items = await MenuItem.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
