const express = require("express");
const app = express();
const router = require('./router.config')
const cors = require('cors')
require('./db.config')


// Parser
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(cors())
app.use(router);
app.use((req, res, next) => {    
    next();
});

app.use((req, res, next) => {
    next({ status: 404, message: "Resource not found." });
});
// Error handling middleware
app.use((error, req, res, next) => {
    console.log(error)
    let statusCode = error.status || 500;
    let message = error.message || "Server error ...";
    let details = error.details || null;
    
    res.status(statusCode).json({
        result: details,// Include details if available
        message: message,  // Include the message
        meta: null
    });
});


module.exports = app;

