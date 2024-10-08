--Insert Table Customer
INSERT INTO Customer (customer_name, customer_address, customer_type)
SELECT 
    'Customer ' || gs AS customer_name,
    'Address ' || gs AS customer_address,
    CASE WHEN gs % 2 = 0 THEN 'Standard' ELSE 'Priority' END AS customer_type
FROM 
    GENERATE_SERIES(1, 1000) AS gs;

--Insert Table Account
INSERT INTO account (customer_id, account_balance, encrypted_password)
SELECT 
    c.customer_id AS customer_id, -- Mengambil customer_id yang valid dari tabel Customer
    ROUND(CAST(random() * 1000 AS numeric), 2) AS account_balance, -- Balance acak hingga 1000
    'encrypted_password_' || c.customer_id AS encrypted_password
FROM 
    Customer c
ORDER BY 
    random() -- Acak urutan untuk variasi
LIMIT 1000; -- Menjamin kita mengambil 1000 customer_id yang ada

--Insert Table Transaction
INSERT INTO transaction (transaction_date, account_id, transaction_amount, transaction_type)
SELECT 
    NOW() - (gs * INTERVAL '1 day') AS transaction_date, -- Transaksi setiap hari
    a.account_id, -- Menggunakan account_id yang valid dari tabel Account
    ROUND(CAST(random() * 100 AS numeric), 2) AS transaction_amount, -- Jumlah transaksi acak hingga 100
    CASE WHEN gs % 2 = 0 THEN 'Deposit' ELSE 'Withdraw' END AS transaction_type
FROM 
    Account a, 
    GENERATE_SERIES(1, 1000) AS gs; -- Menghasilkan 1000 transaksi

--Insert Table Safe_Deposit_Box
INSERT INTO safe_deposit_box (box_item, account_id, box_stored_date)
SELECT 
    'Box Item ' || gs AS box_item,
    a.account_id, -- Menggunakan account_id yang valid dari tabel Account
    NOW() - (gs * INTERVAL '1 day') AS box_stored_date -- Menyimpan setiap hari
FROM 
    Account a,
    GENERATE_SERIES(1, 1000) AS gs; -- Menghasilkan 1000 box item


