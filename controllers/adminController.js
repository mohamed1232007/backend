const Product = require("../models/Product");
const Order = require("../models/Order");
const MaintenanceTicket = require("../models/MaintenanceTicket");
const StorePickup = require("../models/StorePickup");
const StoreBooking = require("../models/StoreBooking");

exports.getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ is_active: true });

        const orderStats = await Order.aggregate([
            { $match: { order_status: { $ne: "cancelled" } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ["$order_status", "delivered"] },
                                "$total_amount",
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        const ticketStats = await MaintenanceTicket.aggregate([
            { $match: { status: "delivered" } },
            { $group: { _id: null, revenue: { $sum: "$final_cost" } } },
        ]);

        const pickupStats = await StorePickup.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    revenue: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "completed"] },
                                "$total_amount",
                                0,
                            ],
                        },
                    },
                    pendingCount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
                        },
                    },
                    completedCount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
                        },
                    },
                },
            },
        ]);

        const pendingOrders = await Order.countDocuments({
            order_status: "pending",
        });
        const pendingBookings = await StoreBooking.countDocuments({
            status: "scheduled",
        });
        const completedOrders = await Order.countDocuments({
            order_status: "delivered",
        });
        const activeTickets = await MaintenanceTicket.countDocuments({
            status: { $nin: ["delivered", "cancelled"] },
        });

        const ordersByStatus = await Order.aggregate([
            { $group: { _id: "$order_status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } },
        ]);

        const sixDaysAgo = new Date();
        sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
        sixDaysAgo.setHours(0, 0, 0, 0);

        const deliveredOrders = await Order.aggregate([
            {
                $match: {
                    order_status: "delivered",
                    createdAt: { $gte: sixDaysAgo },
                },
            },
            { $project: { amount: "$total_amount", createdAt: 1 } },
        ]);

        const completedPickups = await StorePickup.aggregate([
            {
                $match: {
                    status: "completed",
                    createdAt: { $gte: sixDaysAgo },
                },
            },
            { $project: { amount: "$total_amount", createdAt: 1 } },
        ]);

        const deliveredTickets = await MaintenanceTicket.aggregate([
            {
                $match: {
                    status: "delivered",
                    createdAt: { $gte: sixDaysAgo },
                },
            },
            { $project: { amount: "$final_cost", createdAt: 1 } },
        ]);

        const allRevenues = [
            ...deliveredOrders,
            ...completedPickups,
            ...deliveredTickets,
        ];

        const timelineMap = {};
        allRevenues.forEach((item) => {
            const dateStr = item.createdAt.toISOString().split("T")[0];
            timelineMap[dateStr] =
                (timelineMap[dateStr] || 0) + (item.amount || 0);
        });

        const timelineData = Object.keys(timelineMap)
            .sort()
            .map((date_val) => ({
                date_val,
                daily_revenue: timelineMap[date_val],
            }));

        const recentTickets = await MaintenanceTicket.find()
            .sort({ createdAt: -1 })
            .limit(5);

        const totalOrdersCountVal = orderStats[0]?.count || 0;
        const totalOrdersRevenueVal = orderStats[0]?.totalRevenue || 0;
        const ticketsRevenueVal = ticketStats[0]?.revenue || 0;
        const pickupsRevenueVal = pickupStats[0]?.revenue || 0;
        const pickupsCountVal = pickupStats[0]?.count || 0;
        const pickupsCompletedVal = pickupStats[0]?.completedCount || 0;
        const pickupsPendingVal = pickupStats[0]?.pendingCount || 0;

        res.json({
            success: true,
            stats: {
                totalProducts,
                totalOrders: totalOrdersCountVal + pickupsCountVal,
                totalRevenue:
                    totalOrdersRevenueVal +
                    ticketsRevenueVal +
                    pickupsRevenueVal,
                pendingOrders:
                    pendingOrders + pickupsPendingVal + pendingBookings,
                completedOrders: completedOrders + pickupsCompletedVal,
                activeTickets,
            },
            chartData: {
                ordersByStatus,
                timeline: timelineData,
            },
            recentTickets,
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({
            success: false,
            message: "فشل تحميل إحصائيات لوحة التحكم",
        });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: "فشل تحميل المنتجات" });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            brand,
            price,
            old_price,
            stock_quantity,
            sku,
            description,
            specs,
            image_url,
        } = req.body;

        if (!name || !category || price === undefined) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "الاسم والقسم والسعر مطلوبون.",
                });
        }

        const product = await Product.create({
            name,
            category,
            brand: brand || null,
            price,
            old_price: old_price || null,
            stock_quantity: stock_quantity || 0,
            sku: sku || null,
            description: description || null,
            specs: specs || null,
            image_url: image_url || null,
        });

        res.status(201).json({
            success: true,
            message: "تم إنشاء المنتج بنجاح",
            productId: product._id,
        });
    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({ success: false, message: "فشل إنشاء المنتج" });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (!updatedProduct) {
            return res
                .status(404)
                .json({ success: false, message: "المنتج غير موجود" });
        }
        res.json({ success: true, message: "تم تحديث المنتج بنجاح" });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ success: false, message: "فشل تحديث المنتج" });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.json({ success: true, message: "تم حذف المنتج بنجاح" });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ success: false, message: "فشل حذف المنتج" });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "فشل تحميل الطلبات" });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order)
            return res
                .status(404)
                .json({ success: false, message: "الطلب غير موجود" });

        res.json({ success: true, order, items: order.items });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "فشل تحميل تفاصيل الطلب",
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { order_status, payment_status } = req.body;

        await Order.findByIdAndUpdate(id, {
            ...(order_status && { order_status }),
            ...(payment_status && { payment_status }),
        });

        res.json({ success: true, message: "تم تحديث حالة الطلب بنجاح" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "فشل تحديث حالة الطلب",
        });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await StoreBooking.find().sort({
            booking_date: -1,
            time_slot: 1,
        });
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "فشل تحميل حجوزات المتجر",
        });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        await StoreBooking.findByIdAndDelete(id);
        res.json({ success: true, message: "تم حذف الحجز بنجاح" });
    } catch (error) {
        res.status(500).json({ success: false, message: "فشل حذف الحجز" });
    }
};

exports.clearAllBookings = async (req, res) => {
    try {
        await StoreBooking.deleteMany({});
        res.json({
            success: true,
            message: "تم مسح كل حجوزات فحص الأجهزة بنجاح",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "فشل مسح حجوزات الفحص",
        });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;

        await StoreBooking.findByIdAndUpdate(id, {
            ...(status && { status }),
            ...(admin_notes && { admin_notes }),
        });

        res.json({ success: true, message: "تم تحديث حالة الحجز بنجاح" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "فشل تحديث حالة الحجز",
        });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await MaintenanceTicket.find().sort({ createdAt: -1 });
        res.json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "فشل تحميل تذاكر الصيانة",
        });
    }
};

exports.createTicket = async (req, res) => {
    try {
        const {
            customer_name,
            customer_phone,
            device_name,
            device_serial,
            reported_issue,
            estimated_cost,
            expected_delivery_date,
        } = req.body;
        const ticketNumber = "TICK-" + Date.now().toString().slice(-6);

        const ticket = await MaintenanceTicket.create({
            ticket_number: ticketNumber,
            customer_name,
            customer_phone,
            device_name,
            device_serial: device_serial || null,
            reported_issue,
            estimated_cost: estimated_cost || 0,
            expected_delivery_date: expected_delivery_date || null,
        });

        res.status(201).json({
            success: true,
            message: "تم إنشاء تذكرة الصيانة",
            ticketId: ticket._id,
            ticketNumber,
            ticket,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "فشل إنشاء التذكرة" });
    }
};

exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            status,
            inspection_findings,
            estimated_cost,
            final_cost,
            expected_delivery_date,
        } = req.body;

        const ticket = await MaintenanceTicket.findById(id);
        if (!ticket)
            return res
                .status(404)
                .json({ success: false, message: "التذكرة غير موجودة" });

        if (status) ticket.status = status;
        if (inspection_findings !== undefined)
            ticket.inspection_findings = inspection_findings;
        if (estimated_cost !== undefined)
            ticket.estimated_cost = estimated_cost;
        if (expected_delivery_date !== undefined)
            ticket.expected_delivery_date = expected_delivery_date;

        if (final_cost !== undefined && final_cost !== null) {
            ticket.final_cost = final_cost;
        } else if (
            status === "delivered" &&
            (!ticket.final_cost || ticket.final_cost === 0)
        ) {
            ticket.final_cost = ticket.estimated_cost;
        }

        await ticket.save();

        res.json({ success: true, message: "تم تحديث التذكرة بنجاح" });
    } catch (error) {
        res.status(500).json({ success: false, message: "فشل تحديث التذكرة" });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        await MaintenanceTicket.findByIdAndDelete(id);
        res.json({ success: true, message: "تم حذف التذكرة بنجاح" });
    } catch (error) {
        res.status(500).json({ success: false, message: "فشل حذف التذكرة" });
    }
};

exports.getAllStorePickups = async (req, res) => {
    try {
        const pickups = await StorePickup.find().sort({ createdAt: -1 });
        res.json({ success: true, pickups });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "فشل تحميل طلبات الاستلام",
        });
    }
};

exports.updateStorePickupStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;

        await StorePickup.findByIdAndUpdate(id, {
            ...(status && { status }),
            ...(admin_notes && { admin_notes }),
        });

        res.json({ success: true, message: "تم تحديث حالة الطلب بنجاح" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "فشل تحديث حالة الطلب",
        });
    }
};

exports.deleteStorePickup = async (req, res) => {
    try {
        const { id } = req.params;
        await StorePickup.findByIdAndDelete(id);
        res.json({ success: true, message: "تم حذف الطلب بنجاح" });
    } catch (error) {
        res.status(500).json({ success: false, message: "فشل حذف الطلب" });
    }
};
