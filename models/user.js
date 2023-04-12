const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const { Team } = require("./team");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 255,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 1024,
    required: true,
  },
  dob: {
    type: Date,
    // required: true
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, username: this.username },
    config.get("jwtPrivateKey")
  );
  return token;
};
userSchema.methods.getTeam = function () {
  return Team.find({ members: this._id });
};
userSchema.methods.set = function (user) {
  this.username = user.username || this.username;
  this.name = user.name || this.name;
  this.email = user.email || this.email;
  this.password = user.password || this.password;
  this.dob = user.dob || this.dob;
};

userSchema.methods.deleteUser = function () {
  this.isDeleted = true;
  this.deletedAt = Date.now();
};
const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    name: Joi.string().min(3).max(50),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    dob: Joi.date(),
  });

  return schema.validate(user);
}

module.exports.User = User;
module.exports.validateUser = validateUser;
module.exports.userSchema = userSchema;
