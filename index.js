const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Blog = require("./models/Blog");
const AppError = require("./utils/AppError");
const catchAsync = require("./utils/catchAsync");
const {
  validateBlog,
  validatePerson,
  validateUser,
  isLoggedIn,
  isBlogAuthor,
  validateComment,
  isCommentAuthor,
} = require("./utils/middlewares");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const fs = require("fs");
const User = require("./models/User");
const Comment = require("./models/Comment");
const imageUpload = require("./utils/imageUpload");
const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/blog-db")
  .catch((error) => console.log("Error:", error.message));

mongoose.connection.on("error", (error) =>
  console.log("Error:", error.message)
);
mongoose.connection.once("open", () => console.log("Database connected"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/blog-db" }),
    secret: "mySecRetTExt",
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

// INDEX - ALL BLOGS
app.get(
  "/blogs",
  catchAsync(async (req, res, next) => {
    const blogs = await Blog.find({})
      .populate({
        path: "author",
        select: "username email image",
      })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
          select: "username email image",
        },
      });
    res.render("blogs/index", { blogs });
  })
);

// NEW
app.get("/blogs/new", isLoggedIn, (req, res) => {
  res.render("blogs/new");
});

app.post(
  "/blogs",
  isLoggedIn,
  imageUpload.single("image"),
  validateBlog,
  catchAsync(async (req, res) => {
    const { title, subtitle, content } = req.body;
    const blog = new Blog({ title, subtitle, content });
    blog.author = req.user;
    blog.image = req.file.path;
    await blog.save();
    req.flash("success", "Successfully added blog");
    res.redirect(`/blogs/${blog.id}`);
  })
);

// SHOW
app.get(
  "/blogs/:id",
  catchAsync(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id)
      .populate({
        path: "author",
        select: "username email image",
      })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
          select: "username email image",
        },
      });
    res.render("blogs/show", { blog, leaveComment: false });
  })
);

// UPDATE
app.get(
  "/blogs/:id/edit",
  isLoggedIn,
  isBlogAuthor,
  catchAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
      .populate({
        path: "author",
        select: "username email image",
      })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
          select: "username email image",
        },
      });
    res.render("blogs/edit", { blog });
  })
);

app.put(
  "/blogs/:id",
  isLoggedIn,
  isBlogAuthor,
  imageUpload.single("image"),
  validateBlog,
  catchAsync(async (req, res, next) => {
    const { title, subtitle, content } = req.body;
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, subtitle, content },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate({
        path: "author",
        select: "username email image",
      })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
          select: "username email image",
        },
      });
    if (req.file) {
      fs.unlink(blog.image, async (error) => {
        if (error) return next(error);
        blog.image = req.file.path;
        await blog.save();
        req.flash("success", "Successfully updated blog");
        res.redirect(`/blogs/${blog.id}`);
      });
    }
  })
);

app.delete(
  "/blogs/:id",
  isLoggedIn,
  isBlogAuthor,
  catchAsync(async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    req.flash("success", "Successfully removed blog");
    res.redirect("/blogs");
  })
);

// COMMENTS
app.get(
  "/blogs/:id/comments",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
      .populate({
        path: "author",
        select: "-password",
      })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "-password",
        },
      });
    res.render("blogs/show", { blog, leaveComment: true });
  })
);

app.post(
  "/blogs/:id/comments",
  isLoggedIn,
  validateComment,
  catchAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    const comment = new Comment(req.body);
    comment.author = req.user;
    blog.comments.push(comment);
    await Promise.all([blog.save(), comment.save()]);
    req.flash("success", "Successfully added comment");
    res.redirect(`/blogs/${blog.id}`);
  })
);

app.delete(
  "/blogs/:id/comments/:commentId",
  isLoggedIn,
  isCommentAuthor,
  catchAsync(async (req, res) => {
    const { id, commentId } = req.params;
    const blog = await Blog.findByIdAndUpdate(id, {
      $pull: { comments: commentId },
    });
    await Comment.findByIdAndDelete(commentId);
    req.flash("success", "Successuflly removed comment");
    res.redirect(`/blogs/${blog.id}`);
  })
);

// USER ROUTES
// REGISTER
app.get("/register", (req, res) => {
  res.render("user/register");
});

app.post(
  "/register",
  imageUpload.single("image"),
  validatePerson,
  catchAsync(async (req, res) => {
    const { username, email, password } = req.body;
    const user = new User({ username, email, image: req.file.path });
    const newUser = await User.register(user, password);
    req.login(newUser, (error) => {
      if (error) return next(error);
      req.flash("success", "You are now successfully registered");
      res.redirect("/blogs");
    });
  })
);

// LOGIN
app.get("/login", (req, res) => {
  res.render("user/login");
});

app.post(
  "/login",
  validateUser,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "You are successfully logged in");
    res.redirect("/blogs");
  }
);

// LOGOUT
app.get("/logout", (req, res) => {
  req.logout((error) => {
    if (error) return next(error);
    req.flash("success", "You are successfully logged out");
    res.redirect("/blogs");
  });
});

app.all("*", (req, res, next) => {
  next(new AppError("Page not found", 404));
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (error) => {
      if (error) throw error;
    });
  }
  const { statusCode = 500 } = error;
  if (!error.message) error.message = "Something went wrong!";
  res.status(statusCode).render("error", { error });
});

app.listen(3000, () => {
  console.log("Server is running");
});
