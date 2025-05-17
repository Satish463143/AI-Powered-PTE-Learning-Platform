const express = require("express");
const app = express();
const router = require('./router.config')
const cors = require('cors')
require('./db.config')


const allowedOrigins = ['http://localhost:5173']; 

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests from allowed origins or no origin (e.g., mobile apps or Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies and credentials
};
app.use(cors(corsOptions));

// Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use((req, res, next) => {   
    next();
});

app.use(router);

app.use((req, res, next) => {
    next({ status: 404, message: "Resource not found." });
});
// Error handling middleware
app.use((error, req, res, next) => {
    console.log(error)
    let statusCode = error.status || 500;
    let message = error.message || "Server error ...";
    let details = error.details || null;

    // mongodb unique error
    if (error.code === 11000) {
        const uniqueFailedKeys = Object.keys(error.keyPattern)
        details = {}
        uniqueFailedKeys.map((field) => {
            details[field] = field + " should be unique"
        })
        statusCode = 400;
        message = "Validation error: Duplicate key";

    }

    res.status(statusCode).json({
        result: details,// Include details if available
        message: message,  // Include the message
        meta: null
    });
});


module.exports = app;

