-- ============================================================
-- Seed Data - Order Management System
-- Password hash = bcrypt('password123')
-- ============================================================

-- ─── USERS ──────────────────────────────────────────────────
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin Training', 'admin@inovasia.com', '$2a$10$LuApxDRcSHnMKiPAA3tR0uxlp8v96Kx5I4YZc7rq7QRDnOtHg0qPC', 'admin'),
('Budi Santoso', 'budi@inovasia.com', '$2a$10$LuApxDRcSHnMKiPAA3tR0uxlp8v96Kx5I4YZc7rq7QRDnOtHg0qPC', 'customer'),
('Siti Nurhaliza', 'siti@inovasia.com', '$2a$10$LuApxDRcSHnMKiPAA3tR0uxlp8v96Kx5I4YZc7rq7QRDnOtHg0qPC', 'customer'),
('Andi Wijaya', 'andi@inovasia.com', '$2a$10$LuApxDRcSHnMKiPAA3tR0uxlp8v96Kx5I4YZc7rq7QRDnOtHg0qPC', 'customer');

-- ─── PRODUCTS ───────────────────────────────────────────────
INSERT INTO products (sku, name, price, stock, description) VALUES
('PROD-001', 'Laptop Asus VivoBook 14', 8500000.00, 25, 'Laptop ringan untuk produktivitas sehari-hari'),
('PROD-002', 'Mouse Logitech MX Master 3', 1200000.00, 50, 'Mouse ergonomis dengan konektivitas multi-device'),
('PROD-003', 'Keyboard Mechanical Keychron K2', 950000.00, 35, 'Keyboard wireless mechanical 75% layout'),
('PROD-004', 'Monitor LG UltraWide 29"', 4200000.00, 15, 'Monitor ultrawide untuk multitasking'),
('PROD-005', 'Headset Sony WH-1000XM5', 4500000.00, 20, 'Headphone noise-cancelling premium'),
('PROD-006', 'USB Hub Anker 7-in-1', 650000.00, 100, 'Hub USB-C multi-port untuk laptop'),
('PROD-007', 'Webcam Logitech C920', 1100000.00, 40, 'Webcam Full HD 1080p untuk meeting'),
('PROD-008', 'SSD Samsung 970 EVO 1TB', 1800000.00, 30, 'NVMe SSD performa tinggi'),
('PROD-009', 'Standing Desk Electric 120cm', 3500000.00, 10, 'Meja berdiri elektrik adjustable'),
('PROD-010', 'Tablet Samsung Galaxy Tab S9', 9000000.00, 12, 'Tablet Android flagship dengan S-Pen');

-- ─── SAMPLE ORDERS ──────────────────────────────────────────
INSERT INTO orders (user_id, order_number, status, subtotal, discount, total) VALUES
(2, 'ORD-20240101-001', 'completed', 9700000.00, 0.00, 9700000.00),
(2, 'ORD-20240115-002', 'processing', 2150000.00, 100000.00, 2050000.00),
(3, 'ORD-20240120-003', 'pending', 4500000.00, 0.00, 4500000.00);

-- ─── SAMPLE ORDER ITEMS ─────────────────────────────────────
-- Order 1: Budi beli Laptop + Mouse
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 8500000.00, 8500000.00),
(1, 2, 1, 1200000.00, 1200000.00);

-- Order 2: Budi beli Keyboard + Mouse
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(2, 3, 1, 950000.00, 950000.00),
(2, 2, 1, 1200000.00, 1200000.00);

-- Order 3: Siti beli Headset
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(3, 5, 1, 4500000.00, 4500000.00);
