-- Memanggil Prosedur untuk Transaction
SELECT * FROM transaction;

CALL insert_transaction(1, 200.00, 'Deposit');

CALL delete_transaction(1); 

CALL update_transaction(1, 250.00, 'Withdrawal');