const Joi = require('joi');

const userDTO = Joi.object({
    userName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\d+$/).required(),
    password: Joi.string().min(8)
    .max(16)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/) //password pattern
    .required()
    .messages({
        "string.pattern.base": "Password must contain at least one lowercase letter, one uppercase letter, one special symbol, and one number."
    }),
    confirmPassword: Joi.string().equal(Joi.ref('password')).required().messages({
        "any.only":"Password and confirmPassword must match"
    }),
})
module.exports = {
    userDTO
}