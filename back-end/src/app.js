const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");

const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");
const reservationsRouter = require("./reservations/reservations.router");
const tablesRouter = require("./tables/tables.router")

const app = express();

// var corsOptions = function(req, res, next){ 
//     res.header('Access-Control-Allow-Origin', req.headers.origin); 
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//     res.header('Access-Control-Allow-Headers', 
//     'Content-Type, Authorization, Content-Length, X-Requested-With');
//      next();
// }

let corsOptions = { 
    origin : ['*', 'http://localhost:3000'], 
    } 
    
app.use(cors(corsOptions))

// let allowedOrigins = ["http://ServerA:3000", "http://ServerB:3000"]
// let origin = req.headers.origin;
// if (allowedOrigins.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", origin); // restrict it to the required domain
// }

// app.use(corsOptions);

app.use(express.json());

app.use("/reservations", reservationsRouter);
app.use("/tables", tablesRouter)

app.use(notFound);
app.use(errorHandler);

module.exports = app;