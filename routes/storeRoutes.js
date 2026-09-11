const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const StoreBooking = require("../models/StoreBooking");
const StorePickup = require("../models/StorePickup");
const MaintenanceTicket = require("../models/MaintenanceTicket");

router.get("/products", async (req, res) => {
    try {
        const products = await Product.find({ is_active: true }).sort({
            createdAt: -1,
        });
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: "فشل تحميل المنتجات" });
    }
});

router.post("/orders", async (req, res) => {
    try {
        const {
            user_id,
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            city,
            items,
            total_amount,
        } = req.body;
        const orderNumber = "ORD-" + Date.now().toString().slice(-6);

        const formattedItems = (items || []).map((item) => ({
            product_id: item.product_id || item.id || null,
            product_name: item.name,
            unit_price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
        }));

        await Order.create({
            order_number: orderNumber,
            user_id: user_id || null,
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            city,
            total_amount,
            items: formattedItems,
        });

        res.status(201).json({
            success: true,
            message: "تم إتمام الطلب بنجاح",
            orderNumber,
        });
    } catch (err) {
        console.error("Order error:", err);
        res.status(500).json({ success: false, message: "فشل إنشاء الطلب" });
    }
});

router.post("/book-visit", async (req, res) => {
    try {
        const {
            user_id,
            customer_name,
            customer_email,
            customer_phone,
            device_type,
            issue_description,
            booking_date,
            time_slot,
        } = req.body;

        if (booking_date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (new Date(booking_date) < today) {
                return res.status(400).json({
                    success: false,
                    message: "لا يمكن حجز موعد في تاريخ سابق لليوم الحالي",
                });
            }
        }

        const bookingCode = "BK-" + Date.now().toString().slice(-6);

        await StoreBooking.create({
            booking_code: bookingCode,
            user_id: user_id || null,
            customer_name,
            customer_email,
            customer_phone,
            device_type,
            issue_description,
            booking_date,
            time_slot,
        });

        res.status(201).json({
            success: true,
            message: "تم حجز موعد المعاينة",
            bookingCode,
        });
    } catch (err) {
        console.error("Booking error:", err);
        res.status(500).json({ success: false, message: "فشل حجز الموعد" });
    }
});

router.post("/store-pickup", async (req, res) => {
    try {
        const {
            user_id,
            customer_name,
            customer_email,
            customer_phone,
            items,
            total_quantity,
            total_amount,
            visit_date,
            time_slot,
            notes,
        } = req.body;

        if (
            !customer_name ||
            !customer_phone ||
            !visit_date ||
            !items ||
            items.length === 0
        ) {
            return res
                .status(400)
                .json({ success: false, message: "بيانات الطلب غير مكتملة" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(visit_date) < today) {
            return res.status(400).json({
                success: false,
                message: "لا يمكن اختيار تاريخ سابق لليوم الحالي",
            });
        }

        const pickupCode = "PK-" + Date.now().toString().slice(-6);

        await StorePickup.create({
            pickup_code: pickupCode,
            user_id: user_id || null,
            customer_name,
            customer_email: customer_email || "",
            customer_phone,
            items,
            total_quantity: total_quantity || 1,
            total_amount: total_amount || 0,
            visit_date,
            time_slot: time_slot || "12:00 PM - 02:00 PM",
            notes: notes || null,
        });

        res.status(201).json({
            success: true,
            message: "تم تسجيل طلب الاستلام بالمحل بنجاح",
            pickupCode,
        });
    } catch (err) {
        console.error("Store pickup error:", err);
        res.status(500).json({
            success: false,
            message: "فشل تسجيل طلب الاستلام",
        });
    }
});

router.get("/track-ticket/:query", async (req, res) => {
    try {
        const query = req.params.query.trim();
        const cleanPhoneQuery = query.replace(/\s+/g, "");

        const regex = new RegExp("^" + query + "$", "i");
        const phoneRegex = new RegExp(
            cleanPhoneQuery.replace(/\+/g, "\\+"),
            "i",
        );

        const tickets = await MaintenanceTicket.find({
            $or: [{ ticket_number: regex }, { customer_phone: phoneRegex }],
        });

        const bookings = await StoreBooking.find({
            $or: [{ booking_code: regex }, { customer_phone: phoneRegex }],
        });

        const orders = await Order.find({
            $or: [{ order_number: regex }, { customer_phone: phoneRegex }],
        });

        const pickups = await StorePickup.find({
            $or: [{ pickup_code: regex }, { customer_phone: phoneRegex }],
        });

        const formattedTickets = tickets.map((t) => ({
            ticket_number: t.ticket_number,
            device_name: t.device_name,
            reported_issue: t.reported_issue,
            inspection_findings: t.inspection_findings,
            status: t.status,
            estimated_cost: t.estimated_cost,
            final_cost: t.final_cost,
            created_at: t.createdAt,
            record_type: "ticket",
        }));

        const formattedBookings = bookings.map((b) => ({
            ticket_number: b.booking_code,
            device_name: b.device_type,
            reported_issue: b.issue_description,
            inspection_findings: null,
            status: b.status,
            estimated_cost: null,
            final_cost: null,
            created_at: b.createdAt,
            booking_date: b.booking_date,
            time_slot: b.time_slot,
            customer_phone: b.customer_phone,
            record_type: "booking",
        }));

        const formattedOrders = orders.map((o) => ({
            ticket_number: o.order_number,
            device_name: o.shipping_address,
            reported_issue: `طلب توصيل - ${o.city}`,
            inspection_findings: null,
            status: o.order_status,
            estimated_cost: null,
            final_cost: o.total_amount,
            created_at: o.createdAt,
            booking_date: null,
            time_slot: null,
            customer_phone: o.customer_phone,
            record_type: "order",
        }));

        const formattedPickups = pickups.map((p) => ({
            ticket_number: p.pickup_code,
            device_name: `${p.total_quantity} قطعة`,
            reported_issue: `طلب استلام بالمحل - ${p.total_quantity} قطعة`,
            inspection_findings: null,
            status: p.status,
            estimated_cost: null,
            final_cost: p.total_amount,
            created_at: p.createdAt,
            booking_date: p.visit_date,
            time_slot: p.time_slot,
            customer_phone: p.customer_phone,
            record_type: "pickup",
        }));

        res.json({
            success: true,
            tickets: [
                ...formattedTickets,
                ...formattedBookings,
                ...formattedOrders,
                ...formattedPickups,
            ],
        });
    } catch (err) {
        console.error("Ticket search error:", err);
        res.status(500).json({
            success: false,
            message: "فشل البحث عن التذكرة",
        });
    }
});

router.put("/cancel-booking/:code", async (req, res) => {
    try {
        const code = req.params.code.trim();
        const { phone } = req.body;

        if (!phone) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "رقم الهاتف مطلوب للتأكد من هويتك",
                });
        }

        const booking = await StoreBooking.findOne({
            booking_code: new RegExp("^" + code + "$", "i"),
        });

        if (!booking) {
            return res
                .status(404)
                .json({ success: false, message: "لم يتم العثور على الحجز" });
        }

        if (
            booking.customer_phone.replace(/\s/g, "") !==
            String(phone).replace(/\s/g, "")
        ) {
            return res
                .status(403)
                .json({
                    success: false,
                    message: "رقم الهاتف غير مطابق لصاحب الحجز",
                });
        }

        if (booking.status === "cancelled") {
            return res
                .status(400)
                .json({ success: false, message: "تم إلغاء هذا الحجز مسبقًا" });
        }

        if (booking.status === "completed" || booking.status === "attended") {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "لا يمكن إلغاء حجز تم تنفيذه بالفعل",
                });
        }

        booking.status = "cancelled";
        await booking.save();

        res.json({ success: true, message: "تم إلغاء الحجز بنجاح" });
    } catch (err) {
        console.error("Cancel booking error:", err);
        res.status(500).json({ success: false, message: "فشل إلغاء الحجز" });
    }
});

module.exports = router;
