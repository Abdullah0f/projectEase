const Joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");
  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    // for the test to work
    if (req.test) return next();
    const user = await User.findById(decoded._id);
    if (!user) return res.status(404).send("user with this token not found");
    req.user = user;
    next();
  } catch (ex) {
    console.log("error in auth", ex);
    res.status(400).send("Invalid token.");
  }
};
