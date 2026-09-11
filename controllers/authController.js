const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config/jwt");

const isProd = process.env.NODE_ENV === "production";
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبون.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "البريد الإلكتروني مسجل بالفعل.",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const role = "customer";

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone || null,
            role,
        });

        const token = jwt.sign(
            { id: user._id, name, email: normalizedEmail, role },
            JWT_SECRET,
            { expiresIn: "7d" },
        );

        res.cookie("token", token, COOKIE_OPTIONS);

        res.status(201).json({
            success: true,
            message: "تم تسجيل المستخدم بنجاح",
            user: {
                id: user._id,
                name,
                email: normalizedEmail,
                role,
                isAdmin: role === "admin",
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: "خطأ في الخادم أثناء التسجيل.",
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "يرجى إدخال البريد الإلكتروني وكلمة المرور.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
            });
        }

        const role = user.role;

        const token = jwt.sign(
            { id: user._id, name: user.name, email: normalizedEmail, role },
            JWT_SECRET,
            { expiresIn: "7d" },
        );

        res.cookie("token", token, COOKIE_OPTIONS);

        res.json({
            success: true,
            message: "تم تسجيل الدخول بنجاح",
            user: {
                id: user._id,
                name: user.name,
                email: normalizedEmail,
                role,
                isAdmin: role === "admin",
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "خطأ في الخادم أثناء تسجيل الدخول.",
        });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "المستخدم غير موجود." });
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isAdmin: user.role === "admin",
            },
        });
    } catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({ success: false, message: "خطأ في الخادم." });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
    });
    res.json({ success: true, message: "تم تسجيل الخروج بنجاح." });
};
