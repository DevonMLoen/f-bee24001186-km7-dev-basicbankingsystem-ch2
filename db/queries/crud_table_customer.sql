-- Memanggil Prosedur untuk Customer
SELECT * FROM customer;

CALL insert_customer('John Doe', '123 Main St', 'Individual');

CALL delete_customer(1); 

CALL update_customer(1, 'Jane Doe', '456 Elm St', 'Corporate');