const Category = require("../models/CategoryModel");

exports.createCategory = async (req, res) => {

try {

    const { categoryName } = req.body;

    const category = await Category.create({
        categoryName
    });

    res.status(201).json({
        message: "Category created successfully",
        category
    });

} catch (error) {

    res.status(500).json({
        message: error.message
    });

}

};