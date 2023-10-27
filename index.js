const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Blog = require("./models/Blog");
const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/blog-db")
  .catch((error) => console.log("Error:", error.message));

mongoose.connection.on("error", (error) =>
  console.log("Error:", error.message)
);
mongoose.connection.once("open", () => console.log("Database connected"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});
// INDEX - ALL BLOGS
app.get("/blogs", async (req, res) => {
  const blogs = await Blog.find({});
  res.render("blogs/index", { blogs });
});
// NEW
app.get("/blogs/new", (req, res) => {
  res.render("blogs/new");
});

app.post("/blogs", async (req, res) => {
  const blog = await Blog.create(req.body);
  res.redirect(`/blogs/${blog.id}`);
});

// SHOW
app.get("/blogs/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.render("blogs/show", { blog });
});

// UPDATE
app.get("/blogs/:id/edit", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.render("blogs/edit", { blog });
});

app.put("/blogs/:id", async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.redirect(`/blogs/${blog.id}`);
});

app.delete("/blogs/:id", async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.redirect("/blogs");
});

app.all("*", (req, res, next) => {
  next(new Error("Page not found"));
});

app.use((error, req, res, next) => {
  const { message = "Something went wrong!" } = error;
  res.status(500).send(message);
});

app.listen(3000, () => {
  console.log("Server is running");
});
