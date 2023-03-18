const users = require("../routes/users");
const auth = require("../routes/auth");
const teams = require("../routes/teams");
const members = require("../routes/members");
// const tasks = require("../routes/tasks");
const projects = require("../routes/projects");
const error = require("../middleware/error");
const express = require("express");
module.exports = function (app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/teams", teams);
  app.use("/api/teams/:teamId/members", members);
  app.use("/api/teams/:teamId/projects", projects);
  // app.use("/api/teams/:teamId/projects/projectId/tasks", tasks);
  app.use(error);
};
