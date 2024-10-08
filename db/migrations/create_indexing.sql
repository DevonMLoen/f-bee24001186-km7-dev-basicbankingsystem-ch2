-- Menambahkan index pada customer_id di tabel Customer
CREATE INDEX idx_customer_id ON customer(customer_id);

-- Menambahkan index pada customer_id di tabel Account
CREATE INDEX idx_account_customer_id ON account(customer_id);

-- Menambahkan index pada account_id di tabel Account
CREATE INDEX idx_account_id ON account(account_id);

-- Menambahkan index pada account_id di tabel Transaction
CREATE INDEX idx_transaction_account_id ON transaction(account_id);

-- Menambahkan index pada account_id di tabel Safe_Deposit_Box
CREATE INDEX idx_safe_deposit_account_id ON safe_deposit_box(account_id);
