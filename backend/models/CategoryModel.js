const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
{
    categoryName: {
        type: String,
        required: true
    }
},
{ timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Category", categorySchema);