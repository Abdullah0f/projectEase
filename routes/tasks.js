const router = require("express").Router();
const { Task, validateTask } = require("../models/task");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const paramTask = require("../middleware/paramTask.js");

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const tasks = await Task.find().sort("name");
    if (!tasks.length) return res.status(404).send("No tasks found.");
    res.send(tasks);
  })
);

router.get(
  "/:taskId",
  paramTask,
  asyncMiddleware(async (req, res) => {
    const task = req.paramTask;
    res.send(task);
  })
);

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validateTask(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const createdBy = req.user._id;
    const task = new Task({ createdBy: createdBy });
    task.setTask(req.body);
    await task.save();
    res.send(task);
  })
);

router.put(
  "/:taskId",
  [auth, paramTask],
  asyncMiddleware(async (req, res) => {
    const { error } = validateTask(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = req.user;
    const task = req.paramTask;
    if (!task.isAdmin(user._id))
      return res.status(403).send("You are NOT authorized to edit this task.");
    task.setTask(req.body);
    await task.save();
    res.send(task);
  })
);

router.delete(
  "/:taskId",
  [auth, paramTask],
  asyncMiddleware(async (req, res) => {
    const user = req.user;
    const task = req.paramTask;
    if (!task.isAdmin(user._id))
      return res
        .status(403)
        .send("You are NOT authorized to delete this task.");
    task.deleteTask();
    await task.save();
    res.send(task);
  })
);
module.exports = router;
