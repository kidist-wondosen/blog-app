const mongoose = require("mongoose");
const fs = require("fs");
const Comment = require("./Comment");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

blogSchema.post("findOneAndDelete", async (blog) => {
  try {
    if (blog.comments.length > 0) {
      await Promise.all(
        blog.comments.map((comment) => Comment.findByIdAndDelete(comment))
      );
    }

    if (blog.image) {
      fs.unlink(blog.image, (error) => {
        if (error) throw error;
      });
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
});

module.exports = mongoose.model("Blog", blogSchema);
