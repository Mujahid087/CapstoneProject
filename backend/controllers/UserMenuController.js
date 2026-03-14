const Category = require("../models/CategoryModel");
const MenuItem = require("../models/MenuItem");


// Get all categories
exports.getCategories = async (req, res) => {

try {

    const categories = await Category.find();

    res.json(categories);

} catch (error) {

    res.status(500).json({ message: error.message });

}
};


// Get menu items by category
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