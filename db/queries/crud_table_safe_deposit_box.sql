-- Memanggil Prosedur untuk Safe Deposit Box
SELECT * FROM safe_deposit_box;

CALL insert_safe_deposit_box(1, 'Gold Necklace');

CALL delete_safe_deposit_box(1);  

CALL update_safe_deposit_box(1, 'Silver Bracelet');