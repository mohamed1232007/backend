const mongoose = require("mongoose");
const addIdField = require("./plugins/addIdField");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        category: { type: String, required: true, default: "laptop" },
        brand: { type: String, default: null },
        price: { type: Number, required: true, default: 0 },
        old_price: { type: Number, default: null },
        stock_quantity: { type: Number, required: true, default: 0 },
        sku: { type: String, unique: true, sparse: true, default: null },
        description: { type: String, default: null },
        specs: { type: mongoose.Schema.Types.Mixed, default: null },
        image_url: { type: String, default: null },
        is_active: { type: Boolean, default: true },
    },
    { timestamps: true },
);

productSchema.plugin(addIdField);

module.exports = mongoose.model("Product", productSchema);
