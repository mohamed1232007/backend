const mongoose = require("mongoose");
const addIdField = require("./plugins/addIdField");

const storeBookingSchema = new mongoose.Schema(
    {
        booking_code: { type: String, required: true, unique: true },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        customer_name: { type: String, required: true },
        customer_email: { type: String, required: true },
        customer_phone: { type: String, required: true },
        device_type: { type: String, required: true },
        issue_description: { type: String, required: true },
        booking_date: { type: Date, required: true },
        time_slot: { type: String, required: true },
        status: {
            type: String,
            enum: ["scheduled", "attended", "completed", "cancelled"],
            default: "scheduled",
        },
        admin_notes: { type: String, default: null },
    },
    { timestamps: true },
);

storeBookingSchema.plugin(addIdField);

module.exports = mongoose.model("StoreBooking", storeBookingSchema);
