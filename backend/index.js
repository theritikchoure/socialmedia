const express = require('express');
const { connectDatabase } = require('./config/database');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();

connectDatabase();

// Using Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Importing Routes
const post = require('./route/post.route');
const user = require('./route/user.route');

app.use('/api', post)
app.use('/api', user)

app.use('/api/health-check', (req, res) => {
    console.log("hii");
    res.status(200).json({
        success: true,
        message: "Server Started",
        result: null
    });
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is Running on ${process.env.PORT}`);
})