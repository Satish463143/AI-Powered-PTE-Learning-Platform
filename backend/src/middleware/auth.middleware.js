
require("dotenv").config();
const jwt = require("jsonwebtoken")
const userSvc = require("../modules/user/user.service");

const loginCheck = async (req, res, next) => {
    try {
       
        let token = req.headers['authorization'] || null;
        if (!token) {
            throw { status: 401, message: "Unauthorized access: Token not provided" };
        }

        token = token.split(" ").pop();

        const data = jwt.verify(token, process.env.JWT_SECRET);
        if(data.hasOwnProperty('type')){
            throw{status:403, message: "Main Token is required"} 
        }

        // Fetch user from the database based on JWT `sub` field
        const user = await userSvc.getSingleUserByFilter({
            _id: data.sub
        });

        if (!user) {
            throw { status: 404, message: "User does not exist" };
        }
        
        req.authUser = {
            _id: user._id,
            name: user.userName,
            email:user.email
        };
        next();
    } catch (exception) {
        next({ status: exception.status || 401, message: exception.message || "Unauthorized" });
    }
};




module.exports = loginCheck;
