const users = require("../routes/users");
const auth = require("../routes/auth");
const teams = require("../routes/teams");
const error = require("../middleware/error");
const express = require("express");
module.exports = function (app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/teams", teams);
  app.use(error);
};
