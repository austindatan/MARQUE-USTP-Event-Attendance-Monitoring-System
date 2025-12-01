// middleware/auth.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

// This middleware checks for a valid JWT token in the request headers
const authMiddleware = (req, res, next) => {
    // 1. Get token from header (e.g., "Bearer TOKEN_STRING")
    const authHeader = req.header('Authorization');
    
    // Check if the header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided or invalid format.' });
    }

    // Extract the token part
    const token = authHeader.replace('Bearer ', '');

    try {
        // 2. Verify token
        // Use the same secret key used to sign the token in auth.js
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
        
        // 3. Attach decoded payload (user ID and role) to the request object
        req.userId = decoded.id; // Used in feedbackController
        req.userRole = decoded.role;
        
        // 4. Continue to the next controller function
        next();
    } catch (err) {
        // Token is invalid (expired, wrong signature, etc.)
        res.status(401).json({ message: 'Token is invalid or expired.' });
    }
};

module.exports = authMiddleware;