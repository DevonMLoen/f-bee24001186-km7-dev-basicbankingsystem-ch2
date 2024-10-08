-- Create Transaction Table
CREATE TABLE transaction (
    transaction_id SERIAL PRIMARY KEY,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Default is current timestamp
    account_id INT NOT NULL,
    transaction_amount NUMERIC(15, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    CONSTRAINT fk_account
        FOREIGN KEY (account_id) REFERENCES Account(account_id)
        ON DELETE CASCADE -- If account is deleted, associated transactions are also deleted
);

-- Alter Table Example
ALTER TABLE transaction
ADD COLUMN transaction_description TEXT;  -- Menambahkan kolom

ALTER TABLE transaction
ALTER COLUMN transaction_description VARCHAR(20);  -- Mengubah tipe data

ALTER TABLE transaction
DROP COLUMN transaction_description;  -- Menghapus kolom

DROP TABLE transaction; --Menghapus table transaction