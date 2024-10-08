-- Memanggil Prosedur untuk Account
SELECT * FROM account;

CALL insert_account(1, 1000.00, 'encrypted_password');

CALL delete_account(1); 

CALL update_account(1, 1500.00, 'new_encrypted_password');



