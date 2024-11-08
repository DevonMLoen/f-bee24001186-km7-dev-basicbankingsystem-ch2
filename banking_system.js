const readline = require("readline");
const { StandardCustomer,PriorityCustomer} = require('./bank_account.js');
// Inisialisasi readline untuk terminal input/output TESTING TESTING TESTING
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}); 

const accounts = {};

function createAccount() {
    rl.question("Enter UserName: ", (name) => {
        rl.question("Enter Password: ", (password) => {
            rl.question("Enter The initial Balance amount: ", (balance) => {
                rl.question("Choose Type Of Account (1. Standard Account, 2. Priority Account): ", (accountType) => {
                    let user;
                    if (accountType === "1") {
                        try {
                            user = new StandardCustomer(parseInt(balance), name, password);
                            console.log(`Standard Account For ${name} is created successfully!\n`);
                            
                        } catch (error) {
                            console.log(`Error : ${error.message}`);
                        }
                    } else if (accountType === "2") {
                        try {
                            user = new PriorityCustomer(parseInt(balance), name, password);
                            console.log(`Priority Account For ${name} is created successfully!\n`);                          
                        } catch (error) {
                            console.log(`Error : ${error.message}`);
                        }
                    } else {
                        console.log("Your choice is invalid.");
                        createAccount();
                        return;
                    }
                    accounts[name] = user;
                    mainMenu();
                });
            });
        });
    });
}

function login() {
    rl.question("Enter UserName: ", (name) => {
        rl.question("Enter Password: ", (password) => {
            const user = accounts[name];
            if (user && user.authenticate(password)) {
                console.log(`Successfully logged in as ${name}\n`);
                userMenu(user);
            } else {
                console.log("Login failed. Try again.\n");
                mainMenu();
            }
        });
    });
}

function mainMenu() {
    console.log("=== Main Menu ===");
    console.log("1. Login");
    console.log("2. Create Account");
    console.log("0. Log Out");
    rl.question("Choose Option: ", (answer) => {
        if (answer === "1") {
            login();
        } else if (answer === "2") {
            createAccount();     
        } else if (answer === "0") {
            rl.close();
        } else {
            console.log("Your Option is invalid.");
            mainMenu();
        }
    });
}

function setTimeoutPromise(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function userMenu(user) {
    console.log("\n=== User Menu ===");
    console.log("1. Deposit");
    console.log("2. Withdraw");
    console.log("3. Check Balance");
    console.log("4. Investment");
    if (user instanceof PriorityCustomer) {
        console.log("5. Deposit an Item to Safe Deposit Box");
        console.log("6. Display Item in Safe Deposit Box");
        console.log("7. Retrieve an Item from Safe Deposit Box");
    }
    console.log("0. Logout");

    rl.question("Choose Option: ", async (answer) => {
        if (answer === "1") {
            rl.question("Deposit amount: ", async (amount) => {
                console.log("Processing Deposit...");
                await setTimeoutPromise(1000); // Simulasi delay 1 detik
                try {
                    user.deposit(parseInt(amount));
                    console.log(`Deposit Successful! Your Balance: ${user.userBalance}\n`);
                } catch (error) {   
                    console.log(`Error : ${error.message}`);
                }
                userMenu(user);
            });
        } else if (answer === "2") {
            rl.question("Withdraw amount: ", async (amount) => {
                console.log("Processing withdraw...");
                await setTimeoutPromise(1000); 
                try {
                    user.withdraw(parseInt(amount));
                    console.log(`Withdraw Successful! Your Balance: ${user.userBalance}\n`);
                } catch (error) {
                    console.log(`Error : ${error.message}`);
                }
                userMenu(user);
            });
        } else if (answer === "3") {
            console.log(user.balance);
            userMenu(user);
        } else if (answer === "4") {
            rl.question("Investment Amount: ", (amount) => {
                try {
                    user.investment(parseInt(amount));
                } catch (error) {
                    console.log(`Error : ${error.message}`);
                }
                userMenu(user);
            });
        } else if (answer === "5" && user instanceof PriorityCustomer) {
            rl.question("Enter the name of the item to deposit: ", (item) => {
                user.storeItem(item);
                userMenu(user);
            });
        } else if (answer === "6" && user instanceof PriorityCustomer) {
            user.displaySafeDepositBox(); 
            userMenu(user);
        } else if (answer === "7" && user instanceof PriorityCustomer) {
            rl.question("Enter the name of the item to retrieve: ", (item) => {
                user.retrieveItem(item);
                userMenu(user);
            });
        } else if (answer === "0") {
            mainMenu();
        } else {
            userMenu();
        }
    });
}

mainMenu();