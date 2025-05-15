const userService = require("./user.service");

class UserController {
    createUser = async(req, res, next) => {
        try {
            const data = userService.transformUserCreate(req);

            const result = await userService.registerUser(data);
            res.json({
                message: "User created successfully",
                result:result,
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    }
    index = (req,res,next)=>{
        try {
            
            
        } catch (exception) {
            console.log(exception)
            next(exception);
            
        }
    }
    showById = (req,res,next)=>{
        try {
            
            
        } catch (exception) {
            console.log(exception)
            next(exception);
            
        }
    }
    update = (req,res,next)=>{
        try {
            
            
        } catch (exception) {
            console.log(exception)
            next(exception);
            
        }
    }
    delete = (req,res,next)=>{
        try {
            
            
        } catch (exception) {
            console.log(exception)
            next(exception);
            
        }
    }
}
module.exports = new UserController
