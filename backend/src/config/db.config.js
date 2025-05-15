require("dotenv").config();
const mongoose = require("mongoose")

mongoose.set('strictPopulate', false);

mongoose.connect(process.env.DB_URL,{
    dbName:process.env.DB_NAME,
    autoCreate:true,
    autoIndex:true,

}).then(()=>{
    console.log("Database connected sucessfuly")
})
.catch((err)=>{
    console.log(err)
    process.exit(1)
})