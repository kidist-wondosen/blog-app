const Joi = require("joi");

module.exports.blogSchema = Joi.object({
  title: Joi.string().min(3).max(50).required(),
  subtitle: Joi.string().required(),
  content: Joi.string().required(),
});
