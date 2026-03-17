const Payment = require("../models/PaymentModel");
const Order = require("../models/OrderModel");
const User = require("../models/User");


const getStartOfDay = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getStartOfWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    const startOfWeek = new Date(d.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
};

const getStartOfMonth = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
};

exports.getMonthlyRevenue = async (req, res) => {
    try {
        const today = getStartOfDay();
        const startOfWeek = getStartOfWeek();
        const startOfMonth = getStartOfMonth();

        const matchValidOrders = {
            $match: {
                $or: [{ paymentStatus: "paid" }, { orderStatus: "delivered" }],
                orderStatus: { $ne: "cancelled" }
            }
        };

        const revenueSumStage = {
            $sum: { $ifNull: ["$finalPrice", { $ifNull: ["$totalPrice", 0] }] }
        };

       
        const kpisResult = await Order.aggregate([
            matchValidOrders,
            {
                $facet: {
                    today: [
                        { $match: { createdAt: { $gte: today } } },
                        { $group: { _id: null, revenue: revenueSumStage } }
                    ],
                    week: [
                        { $match: { createdAt: { $gte: startOfWeek } } },
                        { $group: { _id: null, revenue: revenueSumStage } }
                    ],
                    month: [
                        { $match: { createdAt: { $gte: startOfMonth } } },
                        { $group: { _id: null, revenue: revenueSumStage } }
                    ],
                    allTime: [
                        { $group: { _id: null, revenue: revenueSumStage, count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        const kpis = {
            revenueToday: kpisResult[0].today[0]?.revenue || 0,
            revenueThisWeek: kpisResult[0].week[0]?.revenue || 0,
            revenueThisMonth: kpisResult[0].month[0]?.revenue || 0,
            totalRevenue: kpisResult[0].allTime[0]?.revenue || 0,
            totalPaidOrders: kpisResult[0].allTime[0]?.count || 0,
        };
        kpis.avgOrderValue = kpis.totalPaidOrders > 0 ? Math.round(kpis.totalRevenue / kpis.totalPaidOrders) : 0;

        
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyRevenueRaw = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: twelveMonthsAgo },
                    $or: [{ paymentStatus: "paid" }, { orderStatus: "delivered" }],
                    orderStatus: { $ne: "cancelled" }
                } 
            },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    totalRevenue: revenueSumStage,
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const monthlyRevenue = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        for (let i = 11; i >= 0; i--) {
            let year = currentYear;
            let month = currentMonth - i;
            if (month <= 0) {
                month += 12;
                year -= 1;
            }
            const found = monthlyRevenueRaw.find(m => m._id.year === year && m._id.month === month);
            monthlyRevenue.push({
                _id: { year, month },
                totalRevenue: found ? found.totalRevenue : 0,
                orderCount: found ? found.orderCount : 0
            });
        }

        
        const revenueByCategory = await Order.aggregate([
            matchValidOrders,
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "menuitems", 
                    localField: "items.itemId",
                    foreignField: "_id",
                    as: "menuItemDetails"
                }
            },
            { $unwind: "$menuItemDetails" },
            {
                $lookup: {
                    from: "categories", 
                    localField: "menuItemDetails.categoryId",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $group: {
                    _id: "$categoryDetails.categoryName",
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        res.json({
            kpis,
            monthlyRevenue,
            revenueByCategory: revenueByCategory.map(c => ({ name: c._id, value: c.revenue }))
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.adminDashboard = async (req, res) => {
    try {
        const today = getStartOfDay();

     
        const totalUsers = await User.countDocuments({ role: "customer" });
        const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });

       
        const todayStats = await Order.aggregate([
            { $match: { createdAt: { $gte: today } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    revenue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $or: [{ $eq: ["$paymentStatus", "paid"] }, { $eq: ["$orderStatus", "delivered"] }] },
                                        { $ne: ["$orderStatus", "cancelled"] }
                                    ]
                                },
                                { $ifNull: ["$finalPrice", { $ifNull: ["$totalPrice", 0] }] },
                                0
                            ]
                        }
                    }
                }
            }
        ]);
        const ordersToday = todayStats[0]?.count || 0;
        const revenueToday = todayStats[0]?.revenue || 0;

        
        const recentOrders = await Order.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .limit(5);

        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const ordersTrendRaw = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        
        const ordersTrend = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            
            const found = ordersTrendRaw.find(x => x._id === dateStr);
            ordersTrend.push({
                date: dateStr,
                orders: found ? found.orders : 0
            });
        }

        res.json({
            totalUsers,
            pendingOrders,
            ordersToday,
            revenueToday,
            recentOrders,
            ordersTrend
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};