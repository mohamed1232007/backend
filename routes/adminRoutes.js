const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, requireAdmin } = require("../middleware/auth");

router.use(verifyToken, requireAdmin);

router.get("/stats", adminController.getDashboardStats);

router.get("/products", adminController.getAllProducts);
router.post("/products", adminController.createProduct);
router.put("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);

router.get("/orders", adminController.getAllOrders);
router.get("/orders/:id", adminController.getOrderDetails);
router.put("/orders/:id/status", adminController.updateOrderStatus);

router.get("/bookings", adminController.getAllBookings);
router.delete("/bookings/clear-all", adminController.clearAllBookings);
router.delete("/bookings/:id", adminController.deleteBooking);
router.put("/bookings/:id/status", adminController.updateBookingStatus);

router.get("/tickets", adminController.getAllTickets);
router.post("/tickets", adminController.createTicket);
router.put("/tickets/:id", adminController.updateTicket);
router.delete("/tickets/:id", adminController.deleteTicket);

router.get("/store-pickups", adminController.getAllStorePickups);
router.put(
    "/store-pickups/:id/status",
    adminController.updateStorePickupStatus,
);
router.delete("/store-pickups/:id", adminController.deleteStorePickup);

module.exports = router;
