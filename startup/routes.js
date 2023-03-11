const user = require("../routes/users");
const express = require("express");
module.exports = function (app) {
  app.use(express.json());
  app.use("/api/users", user);
};
