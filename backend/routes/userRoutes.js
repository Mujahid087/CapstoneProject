// const express = require("express");
// const router = express.Router();

// const auth = require("../controllers/UserAuthController");
// const menu = require("../controllers/UserMenuController");
// const cart = require("../controllers/UserCartController");
// const order = require("../controllers/UserOrderController");
// const payment = require("../controllers/UserPaymentController");
// const message = require("../controllers/UserMessageController");
// const addressController=require("../controllers/UserAdressController")


// // Auth
// router.post("/register", auth.registerUser);
// router.post("/login", auth.loginUser);
// router.post("/logout", auth.logoutUser);


// // Menu
// router.get("/categories", menu.getCategories);
// router.get("/menu/:categoryId", menu.getMenuByCategory);


// // Cart
// router.post("/cart", cart.addToCart);
// router.get("/cart/:userId", cart.getCart);
// router.delete("/cart/:id", cart.removeCartItem);


// // Orders
// router.post("/order", order.placeOrder);
// router.put("/order/cancel/:id", order.cancelOrder);
// router.get("/orders/:userId", order.getUserOrders);


// // Payment
// router.post("/payment", payment.makePayment);


// // Messages
// router.get("/messages/:userId", message.getUserMessages);


// router.post("/address", addressController.addAddress);

// router.get("/:userId", addressController.getUserAddresses);

// router.put("/:id", addressController.updateAddress);

// router.delete("/:id", addressController.deleteAddress);


// module.exports = router;


const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/AuthMiddleWare");

const auth = require("../controllers/UserAuthController");
const menu = require("../controllers/UserMenuController");
const cart = require("../controllers/UserCartController");
const order = require("../controllers/UserOrderController");
const payment = require("../controllers/UserPaymentController");
const message = require("../controllers/UserMessageController");
const addressController = require("../controllers/UserAdressController");
const favorite = require("../controllers/UserFavoriteController");


// Auth
router.post("/register", auth.registerUser);
router.post("/login", auth.loginUser);
router.post("/verify-otp", auth.verifyOtp);
router.post("/resend-otp", auth.resendOtp);
router.post("/logout", authMiddleware, auth.logoutUser);
router.get("/profile", authMiddleware, auth.getProfile);
router.put("/profile", authMiddleware, auth.updateProfile);


// Menu
router.get("/categories", menu.getCategories);
router.get("/menu", menu.getAllMenuItems);
router.get("/menu/:categoryId", menu.getMenuByCategory);


// Cart
router.post("/cart", authMiddleware, cart.addToCart);
router.get("/cart/:userId", authMiddleware, cart.getCart);
router.put("/cart/:userId/:itemId", authMiddleware, cart.updateCartQuantity);
router.delete("/cart/:userId/:itemId", authMiddleware, cart.removeCartItem);
router.delete("/cart/:userId", authMiddleware, cart.clearCart);

// Favorites
router.get("/favorites", authMiddleware, favorite.getFavorites);
router.post("/favorites/:itemId", authMiddleware, favorite.addFavorite);
router.delete("/favorites/:itemId", authMiddleware, favorite.removeFavorite);


// Orders
router.post("/order", authMiddleware, order.placeOrder);
router.put("/order/cancel/:id", authMiddleware, order.cancelOrder);
router.get("/orders/:userId", authMiddleware, order.getUserOrders);
router.get("/order/:id", authMiddleware, order.getOrderById);


// Payment
router.post("/payment", authMiddleware, payment.makePayment);


// Messages
router.get("/messages/:userId", authMiddleware, message.getUserMessages);
router.put("/messages/:id/read", authMiddleware, message.markAsRead);


// Address
router.post("/address", authMiddleware, addressController.addAddress);
router.get("/address/:userId", authMiddleware, addressController.getUserAddresses);
router.put("/address/:id", authMiddleware, addressController.updateAddress);
router.delete("/address/:id", authMiddleware, addressController.deleteAddress);


module.exports = router;
