-- Create Account Table
CREATE TABLE account (
    account_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    account_balance NUMERIC(15, 2) DEFAULT 0.00, 
    encrypted_password TEXT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    CONSTRAINT fk_customer
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
        ON DELETE CASCADE -- If customer is deleted, associated accounts are also deleted
);

-- Alter Table Example
ALTER TABLE account
ADD COLUMN account_status TEXT DEFAULT 'active';  -- Menambahkan kolom

ALTER TABLE account
ALTER COLUMN account_status TYPE DECIMAL(18, 2);  -- Mengubah tipe data

ALTER TABLE account
DROP COLUMN account_status;  -- Menghapus kolom

DROP TABLE account; -- menghapus table account
