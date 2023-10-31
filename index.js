const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Blog = require("./models/Blog");
const AppError = require("./utils/AppError");
const catchAsync = require("./utils/catchAsync");
const { validateBlog } = require("./utils/middlewares");
const ejsMate = require("ejs-mate");
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

app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});
// INDEX - ALL BLOGS
app.get(
  "/blogs",
  catchAsync(async (req, res, next) => {
    const blogs = await Blog.find({});
    res.render("blogs/index", { blogs });
  })
);
// NEW
app.get("/blogs/new", (req, res) => {
  res.render("blogs/new");
});

app.post(
  "/blogs",
  validateBlog,
  catchAsync(async (req, res) => {
    const blog = await Blog.create(req.body);
    res.redirect(`/blogs/${blog.id}`);
  })
);

// SHOW
app.get(
  "/blogs/:id",
  catchAsync(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);
    res.render("blogs/show", { blog });
  })
);

// UPDATE
app.get(
  "/blogs/:id/edit",
  catchAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    res.render("blogs/edit", { blog });
  })
);

app.put(
  "/blogs/:id",
  validateBlog,
  catchAsync(async (req, res) => {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.redirect(`/blogs/${blog.id}`);
  })
);

app.delete(
  "/blogs/:id",
  catchAsync(async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect("/blogs");
  })
);

app.all("*", (req, res, next) => {
  next(new AppError("Page not found", 404));
});

app.use((error, req, res, next) => {
  const { message = "Something went wrong!", statusCode = 500 } = error;
  res.status(statusCode).send(message);
});

app.listen(3000, () => {
  console.log("Server is running");
});
