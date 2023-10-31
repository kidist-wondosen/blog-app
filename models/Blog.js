const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    content: String,
    image: String,
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
