const mongoose = require("mongoose");
const addIdField = require("./plugins/addIdField");

const maintenanceTicketSchema = new mongoose.Schema(
    {
        ticket_number: { type: String, required: true, unique: true },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        customer_name: { type: String, required: true },
        customer_phone: { type: String, required: true },
        device_name: { type: String, required: true },
        device_serial: { type: String, default: null },
        reported_issue: { type: String, required: true },
        inspection_findings: { type: String, default: null },
        status: {
            type: String,
            enum: [
                "received",
                "diagnosing",
                "waiting_parts",
                "in_progress",
                "ready_for_pickup",
                "delivered",
                "cancelled",
            ],
            default: "received",
        },
        estimated_cost: { type: Number, default: 0 },
        final_cost: { type: Number, default: 0 },
        expected_delivery_date: { type: Date, default: null },
    },
    { timestamps: true },
);

maintenanceTicketSchema.plugin(addIdField);

module.exports = mongoose.model("MaintenanceTicket", maintenanceTicketSchema);
