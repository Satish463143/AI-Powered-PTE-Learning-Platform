const jwt = require('jsonwebtoken');
const UserModel = require('../modules/user/user.model');
const mongoose = require('mongoose');

const authOrAnonymous = async (req, res, next) => {
    try {
        // Check if token exists in the Authorization header
        const token = req.headers['authorization'] ? req.headers['authorization'].split(' ').pop() : null;
        

        if (token) {
            try {
                // Validate the token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await UserModel.findById(decoded.sub);

                if (!user) {
                    throw { status: 401, message: 'Invalid token: user not found' };
                }

                // If the token belongs to a logged-in user, set user details
                req.authUser = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                };
                req.userId = user._id;
            } catch (err) {
                throw { status: 401, message: 'Invalid or expired token' };
            }
        } else {
            // For anonymous users, check if they have an existing session cookie
            let anonymousUserId = req.cookies.anonymousUserId;
            
            if (!anonymousUserId) {
                // Create a new anonymous user ID and set it as a cookie
                anonymousUserId = new mongoose.Types.ObjectId().toString();
                
                // Set cookie with 30 days expiration
                res.cookie('anonymousUserId', anonymousUserId, {
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
                    httpOnly: true, // Cookie cannot be accessed via client-side scripts
                    secure: false, // Allow non-HTTPS in development
                    sameSite: 'lax', // CSRF protection
                    path: '/' // Ensure cookie is available across all paths
                });
                
            } 
            
            req.userId = anonymousUserId;
            req.authUser = null; // No authenticated user
        }

        next();
    } catch (err) {
        console.log('Auth middleware error:', err);
        next(err);
    }
};

module.exports = authOrAnonymous;
