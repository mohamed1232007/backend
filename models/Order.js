const mongoose = require("mongoose");
const addIdField = require("./plugins/addIdField");

const orderItemSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null,
    },
    product_name: { type: String, required: true },
    unit_price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
    {
        order_number: { type: String, required: true, unique: true },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        customer_name: { type: String, required: true },
        customer_email: { type: String, required: true },
        customer_phone: { type: String, required: true },
        shipping_address: { type: String, required: true },
        city: { type: String, required: true },
        total_amount: { type: Number, required: true },
        items: [orderItemSchema],
        order_status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },
        payment_status: {
            type: String,
            enum: ["unpaid", "paid", "refunded"],
            default: "unpaid",
        },
        payment_method: { type: String, default: "cash_on_delivery" },
        notes: { type: String, default: null },
    },
    { timestamps: true },
);

orderItemSchema.plugin(addIdField);
orderSchema.plugin(addIdField);

module.exports = mongoose.model("Order", orderSchema);
