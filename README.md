# Banking Application

This is a simple console-based banking application built using JavaScript and Node.js. The application allows users to create accounts, deposit and withdraw money, invest, and manage a safe deposit box (available for priority customers).

## Flowchart
![Flowchart](Flowchart.png)

## Features

- **Account Types**:
  - Standard Account
  - Priority Account (with additional features like safe deposit box)

- **User Operations**:
  - Create Account
  - Login
  - Deposit Money
  - Withdraw Money
  - Check Balance
  - Investment Opportunities
  - Safe Deposit Box Management (for Priority Accounts):
    - Store Items
    - Retrieve Items
    - Display Stored Items

## Running the Program

To run the application, use the following command:

```bash
npm run start
```

## Usage

### Creating an Account

1. Choose the **Create Account** option from the main menu.
2. Enter your **username**, **password**, and **initial balance**.
3. Select the type of account:
   - **1** for Standard Account
   - **2** for Priority Account

If successful, you will see a confirmation message.

### Logging In

1. Choose the **Login** option from the main menu.
2. Enter your **username** and **password**.
3. If the credentials are correct, you will be logged into your account.

### User Menu Options

Once logged in, you can perform various operations from the user menu:

1. **Deposit**: Enter the amount you wish to deposit.
2. **Withdraw**: Enter the amount you wish to withdraw.
3. **Check Balance**: View your current balance.
4. **Investment**: Enter the amount to invest. 
   - **Priority Customers** have an investment rate of **10%**.
   - **Standard Customers** have an investment rate of **3%**.
5. **Safe Deposit Box Management** (for Priority Customers):
   - **Store Item**: Enter the name of the item to store.
   - **Retrieve Item**: Enter the name of the item to retrieve.
   - **Display Items**: Show all items currently in the safe deposit box.

### Logging Out

To log out, select the **Logout** option from the user menu. This will take you back to the main menu.

## Error Handling

The application includes basic error handling for:
- Invalid input for balances, deposits, and withdrawals.
- Authentication failures.
- Insufficient funds for withdrawals and investments.

## Example Interaction

```
=== Main Menu ===
1. Login
2. Create Account
0. Log Out
Choose Option: 2
Enter UserName: JohnDoe
Enter Password: mySecretPass
Enter The initial Balance amount: 1000
Choose Type Of Account (1. Standard Account, 2. Priority Account): 2
Priority Account For JohnDoe is created successfully!

=== User Menu ===
1. Deposit
2. Withdraw
3. Check Balance
4. Investment
5. Deposit an Item to Safe Deposit Box
6. Display Item in Safe Deposit Box
7. Retrieve an Item from Safe Deposit Box
0. Logout
Choose Option: 1
Deposit amount: 500
Processing Deposit...
Deposit Successful! Your Balance: 1500
```

## Notes

- The application uses JavaScript's asynchronous features to simulate transaction processing delays.
- The user interface is command-line based and requires input through the terminal.
- The code follows Object-Oriented Programming principles with classes for account management, encapsulation for password handling, and inheritance for account types.

---

Feel free to customize any sections according to your preferences or additional features you may want to add!