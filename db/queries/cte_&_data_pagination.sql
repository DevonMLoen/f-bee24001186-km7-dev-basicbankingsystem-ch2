--CTE (COMMON TABLE EXPRESSION)
--Melihat Customer punya item deposit box apa saja dan diakun yang mana
WITH CustomerAccounts AS ( 
    SELECT 
        c.customer_id,
        c.customer_name,
        a.account_id,
        a.account_balance
    FROM 
        Customer c
    INNER JOIN 
        Account a ON c.customer_id = a.customer_id
),

DepositItems AS (
    SELECT 
        a.account_id,
        s.box_id,
        s.box_item
    FROM 
        Account a
    LEFT JOIN 
        Safe_Deposit_Box s ON a.account_id = s.account_id
)

SELECT 
    ca.customer_id,
    ca.customer_name,
    ca.account_id,
    ca.account_balance,
    di.box_id,
    di.box_item
FROM 
    CustomerAccounts ca
LEFT JOIN 
    DepositItems di ON ca.account_id = di.account_id
ORDER BY --Sorting
    ca.customer_id, ca.account_id
LIMIT 1 OFFSET 0;  --Data Pagination ( Mengambil 1 data di setiap halaman)

--LIMIT 1 OFFSET 1;  (HALAMAN KEDUA)