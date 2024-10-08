-- Create Customer Table
CREATE TABLE customer (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_address TEXT,
    customer_type VARCHAR(50) DEFAULT 'Standard' -- Default customer type
);

-- Alter Table Example
ALTER TABLE customer
ADD COLUMN customer_email TEXT;  -- Menambahkan kolom

ALTER TABLE customer
ALTER COLUMN customer_email TYPE VARCHAR(255);  -- Mengubah tipe data

ALTER TABLE customer
DROP COLUMN customer_email;  -- Menghapus kolom

DROP TABLE customer; -- menghapus table customer