const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("../models/Product");
const connectDB = require("../config/db");

const sqlProducts = [
    {
        sku: "SKU-00",
        name: "SAMSUNG 55 Inch UHD 4K Smart TV With Receiver",
        category: "electronics",
        price: 22500.0,
        old_price: 25000.0,
        stock_quantity: 20,
        image_url: "img/product/0.png",
    },
    {
        sku: "SKU-01",
        name: "Redmi 13C Dual SIM with 6GB RAM",
        category: "mobiles",
        price: 6400.0,
        old_price: 7000.0,
        stock_quantity: 20,
        image_url: "img/product/1.png",
    },
    {
        sku: "SKU-02",
        name: "Dell Laptop Latitude 5530 Core i7-1255U 8GB SSD",
        category: "electronics",
        price: 36000.0,
        old_price: null,
        stock_quantity: 20,
        image_url: "img/product/2.png",
    },
    {
        sku: "SKU-03",
        name: "Canon EOS RP Mirrorless Camera",
        category: "electronics",
        price: 48000.0,
        old_price: 52000.0,
        stock_quantity: 20,
        image_url: "img/product/3.png",
    },
    {
        sku: "SKU-04",
        name: "OPPO A18 128GB 4GB Glowing Black",
        category: "mobiles",
        price: 5700.0,
        old_price: null,
        stock_quantity: 20,
        image_url: "img/product/4.png",
    },
    {
        sku: "SKU-05",
        name: "Samsung 27-Inch G55C Odyssey QHD 4k",
        category: "electronics",
        price: 14500.0,
        old_price: 16000.0,
        stock_quantity: 20,
        image_url: "img/product/5.png",
    },
    {
        sku: "SKU-06",
        name: "Infinix Smart (Galaxy White, 4GB RAM, 64GB Storage)",
        category: "mobiles",
        price: 4200.0,
        old_price: 4800.0,
        stock_quantity: 20,
        image_url: "img/product/6.png",
    },
    {
        sku: "SKU-07",
        name: "HP Victus Gaming Laptop 8RAM SSD",
        category: "electronics",
        price: 33000.0,
        old_price: 36000.0,
        stock_quantity: 20,
        image_url: "img/product/7.png",
    },
    {
        sku: "SKU-08",
        name: "Xiaomi Redmi 13C Dual SIM 8GB",
        category: "mobiles",
        price: 7200.0,
        old_price: null,
        stock_quantity: 20,
        image_url: "img/product/8.png",
    },
    {
        sku: "SKU-09",
        name: "Handheld Barcode Scanner 1D/2D/QR Code",
        category: "electronics",
        price: 1800.0,
        old_price: 2200.0,
        stock_quantity: 20,
        image_url: "img/product/9.png",
    },
    {
        sku: "SKU-10",
        name: "Large Venue building mapping Projector",
        category: "electronics",
        price: 45000.0,
        old_price: null,
        stock_quantity: 20,
        image_url: "img/product/10.png",
    },
    {
        sku: "SKU-11",
        name: "Infinix Hot 40i (RAM: 4+4GB, 128GB)",
        category: "mobiles",
        price: 5400.0,
        old_price: 6000.0,
        stock_quantity: 20,
        image_url: "img/product/11.png",
    },
    {
        sku: "SKU-12",
        name: "HP DeskJet 2710 Printer, All-in-One",
        category: "electronics",
        price: 3800.0,
        old_price: 4200.0,
        stock_quantity: 20,
        image_url: "img/product/12.png",
    },
    {
        sku: "SKU-13",
        name: "Fuzzy Logic Rice Cooker DIGITAL-JAR 1.8L 940W – HD4515/67",
        category: "appliances",
        price: 4200.0,
        old_price: null,
        stock_quantity: 20,
        image_url: "img/product/13.png",
    },
    {
        sku: "SKU-14",
        name: "Sencor STS 5070SS Electric Toaster for Four Slices",
        category: "appliances",
        price: 2800.0,
        old_price: 3200.0,
        stock_quantity: 20,
        image_url: "img/product/14.png",
    },
    {
        sku: "SKU-15",
        name: "Infinix Smart 6 Plus (Miracle Black)",
        category: "mobiles",
        price: 4100.0,
        old_price: 4600.0,
        stock_quantity: 20,
        image_url: "img/product/15.png",
    },
    {
        sku: "SKU-16",
        name: "Washing Machine 959 Series 8kg Senator Aqua SX, Silver",
        category: "appliances",
        price: 28500.0,
        old_price: 31000.0,
        stock_quantity: 20,
        image_url: "img/product/16.png",
    },
    {
        sku: "SKU-17",
        name: "HIKVISION PTZ Camera 4K Outdoor",
        category: "electronics",
        price: 8500.0,
        old_price: 9500.0,
        stock_quantity: 20,
        image_url: "img/product/17.png",
    },
    {
        sku: "SKU-18",
        name: "OPPO Reno11 5G 256GB 12GB",
        category: "mobiles",
        price: 18500.0,
        old_price: 20000.0,
        stock_quantity: 20,
        image_url: "img/product/18.png",
    },
    {
        sku: "SKU-19",
        name: "VIVAX kettle WH-175L with a capacity of 1.7L",
        category: "appliances",
        price: 950.0,
        old_price: 1200.0,
        stock_quantity: 20,
        image_url: "img/product/19.png",
    },
    {
        sku: "SKU-20",
        name: "Kenstar Ester ABS Plastic 750W Mixer Grinder",
        category: "appliances",
        price: 3200.0,
        old_price: 3800.0,
        stock_quantity: 20,
        image_url: "img/product/20.png",
    },
    {
        sku: "SKU-21",
        name: "Multifunctional Food Processor",
        category: "appliances",
        price: 3600.0,
        old_price: 4200.0,
        stock_quantity: 20,
        image_url: "img/product/21.png",
    },
    {
        sku: "SKU-22",
        name: "Zanussi Washing Machine 8 Kg 1200 RPM",
        category: "appliances",
        price: 21500.0,
        old_price: 24000.0,
        stock_quantity: 20,
        image_url: "img/product/22.png",
    },
    {
        sku: "SKU-23",
        name: "Sharp 42 Lt Electronic Oven Convection",
        category: "appliances",
        price: 5800.0,
        old_price: 6500.0,
        stock_quantity: 20,
        image_url: "img/product/23.png",
    },
    {
        sku: "SKU-24",
        name: "Lenovo Monitor Legion R27fc-30 Gaming Curved",
        category: "electronics",
        price: 11500.0,
        old_price: 13000.0,
        stock_quantity: 20,
        image_url: "img/product/24.png",
    },
];

const seedDB = async () => {
    try {
        await connectDB();
        await Product.deleteMany({});
        console.log("Cleared old products...");

        await Product.insertMany(sqlProducts);
        console.log("✅ Successfully seeded 25 products to MongoDB Atlas!");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding products:", err);
        process.exit(1);
    }
};

seedDB();
