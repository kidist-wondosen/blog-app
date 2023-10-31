const Joi = require("joi");

module.exports.blogSchema = Joi.object({
  title: Joi.string().min(3).required(),
  subtitle: Joi.string().required(),
  content: Joi.string().required(),
  image: Joi.string().required(),
});

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports.personSchema = Joi.object({
  username: Joi.string().min(3).max(40).required(),
  email: Joi.string().pattern(emailPattern).required(),
  password: Joi.string().pattern(passwordPattern).required(),
  image: Joi.string().required(),
});

module.exports.userSchema = Joi.object({
  username: Joi.string().min(3).max(40).required(),
  password: Joi.string().pattern(passwordPattern).required(),
});
