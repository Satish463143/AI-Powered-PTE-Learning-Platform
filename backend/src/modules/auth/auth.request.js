const Joi = require("joi")

const LoginDTO= Joi.object({
    email:Joi.string().email().required(),
    password:Joi.string().required()
})

module.exports ={
    LoginDTO
}