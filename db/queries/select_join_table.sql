-- Mendapat account customer
SELECT * FROM customer a INNER JOIN account b on a.customer_id = b.customer_id;

--Mendapat Transaksi Account
SELECT * FROM account a INNER JOIN transaction b on a.account_id = b.account_id;

--Mendapatkan Item deposit box Account
SELECT * FROM account a INNER JOIN safe_deposit_box b on a.account_id = b.account_id;

SELECT * FROM customer WHERE customer_id = '1'; --Filter data

--Total Records Customer
SELECT COUNT(*) FROM customer;