const AppError = require("./AppError");
const { blogSchema, personSchema, userSchema } = require("./schemas");

module.exports.validateBlog = (req, res, next) => {
  const { error } = blogSchema.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((el) => el.message).join(",");
    return next(new AppError(errorMessage, 400));
  }
  next();
};

module.exports.validatePerson = (req, res, next) => {
  const { error } = personSchema.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((el) => el.message).join(",");
    return next(new AppError(errorMessage, 400));
  }
  next();
};

module.exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((el) => el.message).join(",");
    return next(new AppError(errorMessage, 400));
  }
  next();
};
