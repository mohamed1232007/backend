const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const storeRoutes = require("./routes/storeRoutes");
const connectDB = require("./config/db");
const { verifyToken, requireAdmin } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    }),
);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "cdclttus",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "techstore_uploads",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
    },
});

const upload = multer({ storage });

app.post("/api/admin/upload-image", verifyToken, requireAdmin, (req, res) => {
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Cloudinary parameters missing from .env");
        return res.status(500).json({
            success: false,
            message: "فشل رفع الصورة: إعدادات Cloudinary غير كافية في .env",
        });
    }

    upload.single("image")(req, res, (err) => {
        if (err) {
            console.error("Image upload error:", err);
            return res.status(500).json({
                success: false,
                message: "فشل رفع الصورة للتخزين السحابي",
            });
        }

        if (!req.file) {
            return res
                .status(400)
                .json({ success: false, message: "لم يتم رفع صورة" });
        }

        res.json({
            success: true,
            imageUrl: req.file.path,
            filename: req.file.filename,
        });
    });
});

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/store", storeRoutes);
app.use("/store", storeRoutes);

app.get("/api/health", (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    res.status(isConnected ? 200 : 500).json({
        status: isConnected ? "healthy" : "unhealthy",
        database: isConnected ? "connected" : "disconnected",
        timestamp: new Date(),
    });
});

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
});

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(
            `🚀 TechStore OS Server running on http://localhost:${PORT}`,
        );
    });
}

module.exports = app;
