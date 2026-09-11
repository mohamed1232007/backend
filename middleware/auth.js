const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config/jwt");

const verifyToken = (req, res, next) => {
    let token = req.headers["authorization"];

    if (token && token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "تم رفض الوصول. لا يوجد رمز مصادقة.",
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "رمز الدخول غير صالح أو منتهي الصلاحية.",
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res
            .status(401)
            .json({ success: false, message: "غير مصرح. يرجى تسجيل الدخول." });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "غير مسموح. هذه الصفحة مخصصة للمديرين فقط.",
        });
    }

    next();
};

module.exports = { verifyToken, requireAdmin };
