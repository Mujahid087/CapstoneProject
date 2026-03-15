const User = require("../models/User");
const MenuItem = require("../models/MenuItem");

exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("favorites");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.favorites || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addFavorite = async (req, res) => {
    try {
        const { itemId } = req.params;

        const [user, menuItem] = await Promise.all([
            User.findById(req.user.id),
            MenuItem.findById(itemId),
        ]);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        const alreadyFavorite = user.favorites.some(
            (favoriteId) => favoriteId.toString() === itemId
        );

        if (!alreadyFavorite) {
            user.favorites.push(itemId);
            await user.save();
        }

        await user.populate("favorites");

        res.status(201).json({
            message: "Added to favorites",
            favorites: user.favorites,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const { itemId } = req.params;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.favorites = user.favorites.filter(
            (favoriteId) => favoriteId.toString() !== itemId
        );

        await user.save();
        await user.populate("favorites");

        res.json({
            message: "Removed from favorites",
            favorites: user.favorites,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
