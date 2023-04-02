const { Task } = require("../models/task");
const mongoose = require("mongoose");
module.exports = async function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.taskId))
    return res.status(400).send("invalid task ID.");
  const paramTask = await Task.findById(req.params.taskId);
  if (!paramTask)
    return res.status(404).send("The task with the given ID was not found.");
  if (paramTask.project.toString() !== req.project._id.toString())
    return res.status(400).send("This task does not belong to this project.");
  if (paramTask.isDeleted)
    return res.status(400).send("This task is already deleted.");
  req.task = paramTask;
  next();
};
