const readline = require("readline");
const { StandardCustomer,PriorityCustomer} = require('./bank_account.js');
// Inisialisasi readline untuk terminal input/output
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

