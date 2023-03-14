const Joi = require("joi");

exports.createUserValidation = {
  body: Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(10).required(),
  }),
};

exports.loginUserValiation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

exports.changePasswordValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(10).required(),
    newPassword: Joi.string().min(4).max(10).required(),
  }),
};

exports.forgotPasswordValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
  })
};


exports.postForgotPasswordValidation =  {
    body: Joi.object({
        password: Joi.string().min(4).max(10).required(),
        confirmPassword: Joi.string().min(4).max(10).required(),
        // confirmPassword: Joi.ref('password')
      }),
}