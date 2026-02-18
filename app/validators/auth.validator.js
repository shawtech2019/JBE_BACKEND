const Joi = require("joi")

exports.registerSchema = Joi.object({
    name: Joi.string().min(3).required(), 
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
});

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
});

exports.emailSchema = Joi.object({
    email: Joi.string().email().required()
});

exports.resetOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    password: Joi.string().min(8).required()
})