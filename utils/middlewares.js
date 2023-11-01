const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const AppError = require("./AppError");
const catchAsync = require("./catchAsync");
const {
  blogSchema,
  personSchema,
  userSchema,
  commentSchema,
} = require("./schemas");

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

module.exports.validateComment = (req, res, next) => {
  const { error } = commentSchema.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((el) => el.message).join(",");
    return next(new AppError(errorMessage, 400));
  }
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("success", "You need to login first");
    return res.redirect("/login");
  }
  next();
};

module.exports.isBlogAuthor = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog.author.equals(req.user.id)) {
    req.flash("error", "You are not authorized");
    return res.redirect(`/blogs/${blog.id}`);
  }
  next();
});

module.exports.isCommentAuthor = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  const comment = await Comment.findById(req.params.commentId);
  if (!comment.author.equals(req.user.id)) {
    req.flash("error", "You are not authorized");
    return res.redirect(`/blogs/${blog.id}`);
  }
  next();
});
