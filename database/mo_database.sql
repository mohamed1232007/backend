drop DATABASE if EXISTS mo_database;

CREATE DATABASE mo_database;

USE mo_database;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS store_pickups;
DROP TABLE IF EXISTS store_bookings;
DROP TABLE IF EXISTS maintenance_tickets;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE, 
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'laptop',
    brand VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    old_price DECIMAL(10, 2) DEFAULT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    description TEXT,
    specs JSON,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(30) NOT NULL UNIQUE,
    user_id VARCHAR(36),
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    payment_method VARCHAR(50) DEFAULT 'cash_on_delivery',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(200) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE store_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(30) NOT NULL UNIQUE,
    user_id VARCHAR(36),
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    issue_description TEXT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status ENUM('scheduled', 'attended', 'completed', 'cancelled') DEFAULT 'scheduled',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE store_pickups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pickup_code VARCHAR(30) NOT NULL UNIQUE,
    user_id VARCHAR(36),
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    items JSON NOT NULL,
    total_quantity INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    visit_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    notes TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE maintenance_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(30) NOT NULL UNIQUE,
    user_id VARCHAR(36),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    device_name VARCHAR(150) NOT NULL,
    device_serial VARCHAR(100),
    reported_issue TEXT NOT NULL,
    inspection_findings TEXT,
    status ENUM(
        'received',
        'diagnosing',
        'waiting_parts',
        'in_progress',
        'ready_for_pickup',
        'delivered',
        'cancelled'
    ) DEFAULT 'received',
    estimated_cost DECIMAL(10, 2) DEFAULT 0.00,
    final_cost DECIMAL(10, 2) DEFAULT 0.00,
    expected_delivery_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO products (name, category, price, old_price, stock_quantity, image_url) VALUES
('SAMSUNG 55 Inch UHD 4K Smart TV With Receiver', 'electronics', 22500.00, 25000.00, 20, 'img/product/0.png'),
('Redmi 13C Dual SIM with 6GB RAM', 'mobiles', 6400.00, 7000.00, 20, 'img/product/1.png'),
('Dell Laptop Latitude 5530 Core i7-1255U 8GB SSD', 'electronics', 36000.00, NULL, 20, 'img/product/2.png'),
('Canon EOS RP Mirrorless Camera', 'electronics', 48000.00, 52000.00, 20, 'img/product/3.png'),
('OPPO A18 128GB 4GB Glowing Black', 'mobiles', 5700.00, NULL, 20, 'img/product/4.png'),
('Samsung 27-Inch G55C Odyssey QHD 4k', 'electronics', 14500.00, 16000.00, 20, 'img/product/5.png'),
('Infinix Smart (Galaxy White, 4GB RAM, 64GB Storage)', 'mobiles', 4200.00, 4800.00, 20, 'img/product/6.png'),
('HP Victus Gaming Laptop 8RAM SSD', 'electronics', 33000.00, 36000.00, 20, 'img/product/7.png'),
('Xiaomi Redmi 13C Dual SIM 8GB', 'mobiles', 7200.00, NULL, 20, 'img/product/8.png'),
('Handheld Barcode Scanner 1D/2D/QR Code', 'electronics', 1800.00, 2200.00, 20, 'img/product/9.png'),
('Large Venue building mapping Projector', 'electronics', 45000.00, NULL, 20, 'img/product/10.png'),
('Infinix Hot 40i (RAM: 4+4GB, 128GB)', 'mobiles', 5400.00, 6000.00, 20, 'img/product/11.png'),
('HP DeskJet 2710 Printer, All-in-One', 'electronics', 3800.00, 4200.00, 20, 'img/product/12.png'),
('Fuzzy Logic Rice Cooker DIGITAL-JAR 1.8L 940W – HD4515/67', 'appliances', 4200.00, NULL, 20, 'img/product/13.png'),
('Sencor STS 5070SS Electric Toaster for Four Slices', 'appliances', 2800.00, 3200.00, 20, 'img/product/14.png'),
('Infinix Smart 6 Plus (Miracle Black)', 'mobiles', 4100.00, 4600.00, 20, 'img/product/15.png'),
('Washing Machine 959 Series 8kg Senator Aqua SX, Silver', 'appliances', 28500.00, 31000.00, 20, 'img/product/16.png'),
('HIKVISION PTZ Camera 4K Outdoor', 'electronics', 8500.00, 9500.00, 20, 'img/product/17.png'),
('OPPO Reno11 5G 256GB 12GB', 'mobiles', 18500.00, 20000.00, 20, 'img/product/18.png'),
('VIVAX kettle WH-175L with a capacity of 1.7L', 'appliances', 950.00, 1200.00, 20, 'img/product/19.png'),
('Kenstar Ester ABS Plastic 750W Mixer Grinder', 'appliances', 3200.00, 3800.00, 20, 'img/product/20.png'),
('Multifunctional Food Processor', 'appliances', 3600.00, 4200.00, 20, 'img/product/21.png'),
('Zanussi Washing Machine 8 Kg 1200 RPM', 'appliances', 21500.00, 24000.00, 20, 'img/product/22.png'),
('Sharp 42 Lt Electronic Oven Convection', 'appliances', 5800.00, 6500.00, 20, 'img/product/23.png'),
('Lenovo Monitor Legion R27fc-30 Gaming Curved', 'electronics', 11500.00, 13000.00, 20, 'img/product/24.png');