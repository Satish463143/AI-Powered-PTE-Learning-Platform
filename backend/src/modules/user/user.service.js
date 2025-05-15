const bcrypt = require("bcrypt");
const UserModel = require("./user.model");

class UserService{
    transformUserCreate =(req,res)=>{
        try{
            const data = req.body;
            // console.log("Data received in transformUserCreate:", JSON.stringify(data));
            data.password = bcrypt.hashSync(data.password,10);
            return data;

        }catch(exception){
            throw exception;
        }
       
    }
    registerUser = async(data)=>{
        try{
            // console.log("Data being sent to model:", JSON.stringify(data));
            const user = await UserModel.create(data);
            return user;
        }catch(exception){
            console.error("Error creating user:", exception);
            throw exception;
        }
    }
    
    //get user by database key
    getSingleUserByFilter = async (filter)=>{
        try{
            const userDetails = await UserModel.findOne(filter);
                if(userDetails){
                    return userDetails
                }else{
                    throw {status:404, message:"Credentials do not match"}
                }
        }
        catch(exception){
           throw exception
        }
       
    }
}
module.exports = new UserService();
