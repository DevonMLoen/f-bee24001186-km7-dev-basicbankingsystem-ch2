const dotenv = require("dotenv");
dotenv.config();
require("../instrument");
const Sentry = require("@sentry/node");
const express = require("express");

const morgan = require('morgan');
const path = require('path');
const prisma = require('./db')
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("../swagger.json");

const app = express();



const PORT = process.env.PORT;

Sentry.setupExpressErrorHandler(app);

const userRoutes = require("./routes/users.js");
const bankAccountRoutes = require("./routes/bank_accounts.js");
const transactionRoutes = require("./routes/transactions.js");
const authRoutes = require("./routes/auth.js");
const mediaRoutes = require("./routes/media.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));

//SWAGGER
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//EJS VIEWS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));

app.use("/images",express.static("public/images"));

app.get('/', async (req, res , next) => {
    try {
        const users = await prisma.user.findMany();
        res.render('index', { users });
    } catch (error) {
        next(error);
    }
});

app.use("/api/v1/users",userRoutes);
app.use("/api/v1/accounts",bankAccountRoutes);
app.use("/api/v1/transactions",transactionRoutes);
app.use("/api/v1/auths",authRoutes);
app.use("/api/v1/media",mediaRoutes);

app.use(function onError(err, req, res , next) {
    const statusCode = err.statusCode || 500;
    res.statusCode = statusCode;

    if (statusCode >= 500 && statusCode < 600) { 
        // Capture server errors and other critical issues
        Sentry.withScope((scope) => {
            scope.setTag("status_code", statusCode);
            Sentry.captureException(err);
        });
    }
    

    res.status(statusCode).json({
        status: err.status || false,
        message: err.message || "Terjadi error pada server.",
        data: err.data || null,
        sentryId: res.sentry,
    });
  });

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});