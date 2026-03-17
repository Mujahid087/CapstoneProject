

































const router = require("express").Router();

const authMiddleware = require("../middlewares/AuthMiddleWare");

const adminAuth = require("../controllers/AdminAuthController");
const menu = require("../controllers/AdminMenuController");
const order = require("../controllers/AdminOrderController");
const message = require("../controllers/AdminMessageController");
const bill = require("../controllers/AdminBillController");
const revenue = require("../controllers/AdminRevenueController");
const categoryController = require("../controllers/AdminCategoryController");
const AdminNotificationController = require("../controllers/AdminNotificationController");

router.post("/login", adminAuth.adminLogin);


router.post("/logout", authMiddleware, adminAuth.adminLogout);
router.get("/users", authMiddleware, adminAuth.getAllUsers);

router.post("/menu", authMiddleware, menu.createMenuItem);
router.get("/menu", authMiddleware, menu.getAllMenuItems);
router.put("/menu/:id", authMiddleware, menu.updateMenuItem);
router.delete("/menu/:id", authMiddleware, menu.deleteMenuItem);

router.post("/category", authMiddleware, categoryController.createCategory);

router.get("/orders", authMiddleware, order.getAllOrders);
router.put("/orders/:id", authMiddleware, order.updateOrderStatus);

router.get("/notifications", authMiddleware, AdminNotificationController.getNotifications);
router.put("/notifications/read", authMiddleware, AdminNotificationController.markAsRead);

router.post("/message", authMiddleware, message.sendMessageToUser);

router.get("/bill/:orderId", authMiddleware, bill.generateBill);

router.get("/revenue", authMiddleware, revenue.getMonthlyRevenue);
router.get("/dashboard", authMiddleware, revenue.adminDashboard);

module.exports = router;