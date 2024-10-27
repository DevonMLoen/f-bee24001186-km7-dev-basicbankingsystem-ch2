const express = require("express");
const dotenv = require("dotenv");
const morgan = require('morgan');
const path = require('path');
const prisma = require('./db')

const app = express();

dotenv.config();

const PORT = process.env.PORT;

const userRoutes = require("./routes/users.js");
const bankAccountRoutes = require("./routes/bank_accounts.js");
const transactionRoutes = require("./routes/transactions.js");
const authRoutes = require("./routes/auth.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

//EJS VIEWS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.render('index', { users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.use("/api/v1/users",userRoutes);
app.use("/api/v1/accounts",bankAccountRoutes);
app.use("/api/v1/transactions",transactionRoutes);
app.use("/api/v1/auths",authRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});