class Bank {
    constructor(userBalance = 0, userName = "Anonymous") {
        //Abstraction
        if (this.constructor === Bank) {
            throw new Error("Cannot instantiate from Abstract Class");
        }
        if (userBalance < 0) {
            throw new ValidationError("The initial Balance amount must be greater than zero.", "userBank");
        }
        if (isNaN(userBalance)) {
            throw new ValidationError("Please provide a Value in the form of a Number", "userBank");
        }
        this.userBalance = parseInt(userBalance);
        this.userName = userName;
    }

    get balance() {
        return `Hello ${this.userName} Your Remaining Balance is ${this.userBalance}`;
    }

    deposit(value = 0) {
        if (value < 0) {
            throw new ValidationError("Failed to deposit Balance\nThe total balance deposited must be more than zero", "Deposit");
        }

        if (isNaN(value)) {
            throw new ValidationError("Failed to deposit Balance\nPlease provide a Value in the form of a Number", "Deposit");
        }
        this.userBalance += parseInt(value);
    }

    withdraw(value = 0) {
        if (value < 0) {
            throw new ValidationError("Failed to withdraw Balance\nThe total balance withdrawn must be more than zero", "Withdraw");
        }

        if (isNaN(value)) {
            throw new ValidationError("Failed to withdraw Balance\nPlease provide a Value in the form of a Number", "Withdraw");
        }

        if (this.userBalance - value < 0) {
            throw new ValidationError("Failed to withdraw Balance\nYour balance is insufficient to be withdrawn", "Withdraw");
        }

        this.userBalance -= parseInt(value);
    }
}

//Error Class
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.field = field;
    }
}

//Inheritance
class Account extends Bank {
    #encryptedPassword;
    constructor(userBalance = 0, userName = "Anonymous", password = "defaultPassword") {
        super(userBalance, userName);
        this.#encryptedPassword = this.#encrypt(password);
    }
    //ENCAPSULATION
    #encrypt(password) {
        return `encrypted-version-of-${password}`;
    }

    #decrypt() {
        return this.#encryptedPassword.split("encrypted-version-of-")[1];
    }

    authenticate(password) {
        return this.#decrypt() === password;
    }

    updatePassword(oldPass, newPass) {
        if (this.authenticate(oldPass)) {
            this.#encryptedPassword = this.#encrypt(newPass);
        }
    }
}