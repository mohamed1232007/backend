require("dotenv").config();

if (!process.env.JWT_SECRET) {
    throw new Error(
        "JWT_SECRET غير موجود في ملف .env. ",
    );
}

module.exports = process.env.JWT_SECRET;
