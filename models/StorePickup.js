const mongoose = require("mongoose");
const addIdField = require("./plugins/addIdField");

const storePickupSchema = new mongoose.Schema(
    {
        pickup_code: { type: String, required: true, unique: true },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        customer_name: { type: String, required: true },
        customer_email: { type: String, default: "" },
        customer_phone: { type: String, required: true },
        items: { type: mongoose.Schema.Types.Mixed, required: true },
        total_quantity: { type: Number, required: true, default: 1 },
        total_amount: { type: Number, required: true, default: 0 },
        visit_date: { type: Date, required: true },
        time_slot: { type: String, required: true },
        notes: { type: String, default: null },
        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "pending",
        },
        admin_notes: { type: String, default: null },
    },
    { timestamps: true },
);

storePickupSchema.plugin(addIdField);

module.exports = mongoose.model("StorePickup", storePickupSchema);
