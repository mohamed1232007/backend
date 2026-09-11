const pool = require("./config/db");
const fs = require("fs");

async function migrate() {
    console.log("Modifying products table structure...");
    await pool.query(
        "ALTER TABLE products MODIFY COLUMN category VARCHAR(100) NOT NULL",
    );

    const [cols] = await pool.query(
        "SHOW COLUMNS FROM products LIKE 'old_price'",
    );
    if (cols.length === 0) {
        await pool.query(
            "ALTER TABLE products ADD COLUMN old_price DECIMAL(10,2) DEFAULT NULL AFTER price",
        );
    }

    const [existing] = await pool.query(
        "SELECT COUNT(*) as count FROM products",
    );
    if (existing[0].count <= 4) {
        const jsonPath = "../frontend/public/products.json";
        if (fs.existsSync(jsonPath)) {
            const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
            console.log(`Migrating ${rawData.length} products to MySQL...`);
            for (const item of rawData) {
                await pool.query(
                    `INSERT INTO products (name, category, price, old_price, stock_quantity, image_url) 
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        item.name,
                        item.category || item.catetory || "electronics",
                        item.price,
                        item.old_price || null,
                        20,
                        item.img,
                    ],
                );
            }
            console.log("All products successfully imported into MySQL!");
        }
    }

    const [total] = await pool.query("SELECT COUNT(*) as count FROM products");
    console.log(`Total active products in MySQL now: ${total[0].count}`);
    process.exit(0);
}

migrate().catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
});
