-- ========================================================
-- Procurement and Purchase Order Management System
-- MySQL Schema and Sample Data Script
-- ========================================================

CREATE DATABASE IF NOT EXISTS procurement_db;
USE procurement_db;

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_code VARCHAR(50) NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30),
    address VARCHAR(255),
    city VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(150) NOT NULL,
    description TEXT,
    unit VARCHAR(30),
    standard_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 3. Purchase Requisitions Table
CREATE TABLE IF NOT EXISTS purchase_requisitions (
    requisition_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    request_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    requested_by VARCHAR(100) NOT NULL,
    required_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Open',
    remarks TEXT
) ENGINE=InnoDB;

-- 3b. Requisition Items (Embeddable line collection)
CREATE TABLE IF NOT EXISTS requisition_items (
    requisition_id BIGINT NOT NULL,
    product_id BIGINT,
    product_sku VARCHAR(50),
    product_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    estimated_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_req_items_requisition FOREIGN KEY (requisition_id) 
        REFERENCES purchase_requisitions(requisition_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
    quotation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quotation_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id BIGINT NOT NULL,
    requisition_id BIGINT NOT NULL,
    quotation_date DATE NOT NULL,
    validity_date DATE NOT NULL,
    quoted_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    delivery_days INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending Review',
    CONSTRAINT fk_quotations_supplier FOREIGN KEY (supplier_id) 
        REFERENCES suppliers(supplier_id),
    CONSTRAINT fk_quotations_requisition FOREIGN KEY (requisition_id) 
        REFERENCES purchase_requisitions(requisition_id)
) ENGINE=InnoDB;

-- 5. Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    purchase_order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id BIGINT NOT NULL,
    requisition_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'Open',
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) 
        REFERENCES suppliers(supplier_id),
    CONSTRAINT fk_po_requisition FOREIGN KEY (requisition_id) 
        REFERENCES purchase_requisitions(requisition_id)
) ENGINE=InnoDB;

-- ========================================================
-- Sample Initial Data (Idempotent Inserts)
-- ========================================================

INSERT IGNORE INTO suppliers (supplier_id, supplier_code, company_name, contact_person, email, phone, address, city, status) VALUES
(1, 'SUP-1001', 'Tata Steel Downstream Products Ltd', 'Sunil Deshmukh', 'contact@tatasteel.com', '+91-22-66658282', 'Bombay House, Homi Mody Street', 'Mumbai', 'Active'),
(2, 'SUP-1002', 'Larsen & Toubro Electrical & Automation', 'Pooja Iyer', 'info@ltts.com', '+91-22-67525656', 'L&T House, Ballard Estate', 'Mumbai', 'Active'),
(3, 'SUP-1003', 'Bosch Rexroth Hydraulics India', 'Karan Verma', 'orders@boschrexroth.co.in', '+91-80-67571000', 'Plot 96, Peenya Industrial Area', 'Bengaluru', 'Active'),
(4, 'SUP-1004', 'SKF India Bearings & Seals', 'Ramesh Nambiar', 'sales@skfindia.com', '+91-20-66112500', 'Chinchwad Industrial Zone', 'Pune', 'Active');

INSERT IGNORE INTO products (product_id, sku, product_name, description, unit, standard_price, active) VALUES
(1, 'PRD-RAW-001', 'Structural Steel Angles 50x50x5mm', 'High tensile structural grade mild steel angle', 'TON', 54500.00, TRUE),
(2, 'PRD-HYD-002', 'Proportional Flow Control Valve 24V', 'Electro-hydraulic proportional directional valve', 'PCS', 18250.00, TRUE),
(3, 'PRD-ELC-003', 'PLC Digital Output Module 16-Channel', '24V DC transistor output module for industrial PLC', 'PCS', 9400.00, TRUE),
(4, 'PRD-MEC-004', 'Deep Groove Ball Bearing 6208-2RS', 'Double sealed chrome steel precision bearing', 'PCS', 680.00, TRUE),
(5, 'PRD-MEC-005', 'Nitrile Rubber O-Ring Kit (Metric)', 'Standard hardness 70 Shore A assortment kit', 'SET', 1250.00, TRUE);

INSERT IGNORE INTO purchase_requisitions (requisition_id, request_number, request_date, department, requested_by, required_date, status, remarks) VALUES
(1, 'REQ-2026-001', '2026-11-20', 'Production & Press Shop', 'Amitabh Roy', '2026-12-05', 'Open', 'Urgent replacement stock for stamping line maintenance'),
(2, 'REQ-2026-002', '2026-11-22', 'Electrical & Automation', 'Deepak Joshi', '2026-12-10', 'Open', 'Components required for automation conveyor line retrofitting'),
(3, 'REQ-2026-003', '2026-11-15', 'Mechanical Maintenance', 'Suresh Nair', '2026-11-30', 'Closed', 'Annual spare replenishment completed');

INSERT IGNORE INTO requisition_items (requisition_id, product_id, product_sku, product_name, quantity, estimated_price) VALUES
(1, 2, 'PRD-HYD-002', 'Proportional Flow Control Valve 24V', 4, 18250.00),
(1, 5, 'PRD-MEC-005', 'Nitrile Rubber O-Ring Kit (Metric)', 5, 1250.00),
(2, 3, 'PRD-ELC-003', 'PLC Digital Output Module 16-Channel', 6, 9400.00),
(3, 4, 'PRD-MEC-004', 'Deep Groove Ball Bearing 6208-2RS', 20, 680.00);

INSERT IGNORE INTO quotations (quotation_id, quotation_number, supplier_id, requisition_id, quotation_date, validity_date, quoted_amount, delivery_days, status) VALUES
(1, 'QT-2026-001', 3, 1, '2026-11-22', '2026-12-15', 78500.00, 7, 'Pending Review'),
(2, 'QT-2026-002', 4, 1, '2026-11-23', '2026-12-20', 76200.00, 10, 'Pending Review'),
(3, 'QT-2026-003', 2, 2, '2026-11-24', '2026-12-25', 55800.00, 5, 'Pending Review');

INSERT IGNORE INTO purchase_orders (purchase_order_id, po_number, supplier_id, requisition_id, order_date, expected_delivery_date, total_amount, status) VALUES
(1, 'PO-2026-001', 4, 3, '2026-11-16', '2026-11-28', 13600.00, 'Delivered'),
(2, 'PO-2026-002', 3, 1, '2026-11-24', '2026-12-04', 78500.00, 'Open');
