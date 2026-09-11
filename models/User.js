const mongoose = require("mongoose");
const addIdField = require("./plugins/addIdField");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true },
        phone: { type: String, default: null },
        role: {
            type: String,
            enum: ["admin", "customer"],
            default: "customer",
        },
    },
    { timestamps: true },
);

userSchema.plugin(addIdField);

module.exports = mongoose.model("User", userSchema);
