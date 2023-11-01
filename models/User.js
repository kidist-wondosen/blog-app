const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
});

userSchema.plugin(uniqueValidator);
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
