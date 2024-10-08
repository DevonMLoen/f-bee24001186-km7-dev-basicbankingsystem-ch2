--Customer
--Insert
CREATE OR REPLACE PROCEDURE insert_customer(
    p_customer_name TEXT,
    p_customer_address TEXT,
    p_customer_type TEXT
) AS $$
BEGIN
    INSERT INTO Customer (customer_name, customer_address, customer_type)
    VALUES (p_customer_name, p_customer_address, p_customer_type);
END;
$$ LANGUAGE plpgsql;

--Delete
CREATE OR REPLACE PROCEDURE delete_customer(
    p_customer_id INT
) AS $$
BEGIN
    DELETE FROM Customer WHERE customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

--Update
CREATE OR REPLACE PROCEDURE update_customer(
    p_customer_id INT,
    p_customer_name TEXT,
    p_customer_address TEXT,
    p_customer_type TEXT
) AS $$
BEGIN
    UPDATE Customer
    SET customer_name = p_customer_name,
        customer_address = p_customer_address,
        customer_type = p_customer_type
    WHERE customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;


--Account
--Insert
CREATE OR REPLACE PROCEDURE insert_account(
    p_customer_id INT,
    p_account_balance NUMERIC,
    p_encrypted_password TEXT
) AS $$
BEGIN
    INSERT INTO Account (customer_id, account_balance, encrypted_password, created_date)
    VALUES (p_customer_id, p_account_balance, p_encrypted_password, CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

--Delete
CREATE OR REPLACE PROCEDURE delete_account(
    p_account_id INT
) AS $$
BEGIN
    DELETE FROM Account WHERE account_id = p_account_id;
END;
$$ LANGUAGE plpgsql;

--Update
CREATE OR REPLACE PROCEDURE update_account(
    p_account_id INT,
    p_account_balance NUMERIC,
    p_encrypted_password TEXT
) AS $$
BEGIN
    UPDATE Account
    SET account_balance = p_account_balance,
        encrypted_password = p_encrypted_password,
        created_date = CURRENT_DATE
    WHERE account_id = p_account_id;
END;
$$ LANGUAGE plpgsql;

--Transaction
--insert
CREATE OR REPLACE PROCEDURE insert_transaction(
    p_account_id INT,
    p_transaction_amount NUMERIC,
    p_transaction_type TEXT
) AS $$
BEGIN
    INSERT INTO Transaction (transaction_date, account_id, transaction_amount, transaction_type)
    VALUES (CURRENT_DATE, p_account_id, p_transaction_amount, p_transaction_type);
END;
$$ LANGUAGE plpgsql;

--Delete
CREATE OR REPLACE PROCEDURE delete_transaction(
    p_transaction_id INT
) AS $$
BEGIN
    DELETE FROM Transaction WHERE transaction_id = p_transaction_id;
END;
$$ LANGUAGE plpgsql;

--Update
CREATE OR REPLACE PROCEDURE update_transaction(
    p_transaction_id INT,
    p_transaction_amount NUMERIC,
    p_transaction_type TEXT
) AS $$
BEGIN
    UPDATE Transaction 
    SET 
        transaction_amount = p_transaction_amount,
        transaction_type = p_transaction_type
    WHERE 
        transaction_id = p_transaction_id;
END;
$$ LANGUAGE plpgsql;

--Deposit Box
--insert
CREATE OR REPLACE PROCEDURE insert_safe_deposit_box(
    p_account_id INT,
    p_box_item TEXT
) AS $$
BEGIN
    INSERT INTO Safe_Deposit_Box (account_id, box_item, box_stored_date)
    VALUES (p_account_id, p_box_item, CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

--delete
CREATE OR REPLACE PROCEDURE delete_safe_deposit_box(
    p_box_id INT
) AS $$
BEGIN
    DELETE FROM Safe_Deposit_Box WHERE box_id = p_box_id;
END;
$$ LANGUAGE plpgsql;

--update
CREATE OR REPLACE PROCEDURE update_safe_deposit_box(
    p_box_id INT,
    p_box_item TEXT
) AS $$
BEGIN
    UPDATE Safe_Deposit_Box 
    SET 
        box_item = p_box_item
    WHERE 
        box_id = p_box_id;
END;
$$ LANGUAGE plpgsql;
