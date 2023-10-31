const AppError = require("./AppError");
const { blogSchema } = require("./schemas");

module.exports.validateBlog = (req, res, next) => {
  const { error } = blogSchema.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((el) => el.message).join(",");
    return next(new AppError(errorMessage, 400));
  }
  next();
};
