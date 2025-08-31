const mongoose = require('mongoose')

const userSchema =new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        min:3,
        max:100,
    },
    email:{
        type:String,
        unique:true,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    subscription:{
        type:String,
        default:null
    },
    token:{
        type:String,
        default:null
    },
    refreshToken:{
        type:String,
        default:null
    },
    activeFor:{ type: Date },
    forgetToken:String,
    forgetFor:String,
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        default:null,
    },
},{
    timestamps:true,
    autoIndex:true,
    autoCreate:true,
})

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;

