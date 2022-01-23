require('dotenv').config();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

exports.isAuthenticated = async(req, res, next) => {
    try {
        const { token } = req.cookies;
        
        if(!token) return res.status(401).json({ success: false, message: "Unauthorized", result: null })

        const decoded = await jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.user._id);

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}
