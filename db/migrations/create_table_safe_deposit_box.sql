-- Create Safe_Deposit_Box Table
CREATE TABLE safe_deposit_box (
    box_id SERIAL PRIMARY KEY,
    box_item TEXT NOT NULL,
    account_id INT NOT NULL,
    box_stored_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Default is current timestamp
    CONSTRAINT fk_account_sdb
        FOREIGN KEY (account_id) REFERENCES Account(account_id)
        ON DELETE CASCADE -- If account is deleted, associated safe deposit boxes are also deleted
);

-- Alter Table Example
ALTER TABLE safe_deposit_box
ADD COLUMN box_description TEXT;  -- Menambahkan kolom

ALTER TABLE safe_deposit_box
ALTER COLUMN box_description TYPE VARCHAR(255);  -- Mengubah tipe data

ALTER TABLE safe_deposit_box
DROP COLUMN box_description;  -- Menghapus kolom\

DROP TABLE safe_deposit_box; --Menghapus Table DEPOSIT