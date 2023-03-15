const { Task } = require("../models/task");
const mongoose = require("mongoose");
module.exports = async function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.taskId))
    return res.status(400).send("invalid task ID.");
  const paramUser = await Task.findById(req.params.taskId);
  if (!paramUser)
    return res.status(404).send("The task with the given ID was not found.");
  if (paramUser.isDeleted)
    return res.status(400).send("This task is already deleted.");
  req.paramUser = paramUser;
  next();
};
