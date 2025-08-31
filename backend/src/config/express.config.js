const express = require("express");
const app = express();
const router = require('./router.config')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const { MulterError } = require("multer");
const { storage, bucket, bucketName } = require('./googleCloud.config');

require('./db.config')
require('dotenv').config();

// Bind cloud storage to app
app.locals.storage = storage;
app.locals.bucket = bucket;
app.locals.bucketName = bucketName;

const allowedOrigins = ['http://localhost:5173']; 

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies and credentials
    optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


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
    // multer error handling (Image, video error)
    if (error instanceof MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            statusCode = 422,
                details = {
                    [error.field]: "File size too large. File must be less than 2MB"
                }
        }
    }

    res.status(statusCode).json({
        result: details,// Include details if available
        message: message,  // Include the messagecd 
        meta: null
    });
});


module.exports = app;

