const router = require("express").Router({ mergeParams: true });
const { Task, validateTask } = require("../models/task");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const paramTask = require("../middleware/paramTask.js");
const paramProject = require("../middleware/paramProject.js");
const paramTeam = require("../middleware/paramTeam");
const inTeam = require("../middleware/inTeam");

router.get(
  "/",
  [auth, paramTeam, inTeam, paramProject],
  asyncMiddleware(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const tasks = await Task.find({
      project: req.project._id,
      isDeleted: false,
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort("name");
    res.send(tasks);
  })
);

router.get(
  "/:taskId",
  [auth, paramTeam, inTeam, paramProject, paramTask],
  asyncMiddleware(async (req, res) => {
    const task = req.task;
    res.send(task);
  })
);

router.post(
  "/",
  [auth, paramTeam, inTeam, paramProject],
  asyncMiddleware(async (req, res) => {
    const { error } = validateTask(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const createdBy = req.user._id;
    const project = req.project;
    const task = new Task({ createdBy: createdBy, project: project._id });
    task.setTask(req.body);
    await task.save();
    res.send(task);
  })
);

router.put(
  "/:taskId",
  [auth, paramTeam, inTeam, paramProject, paramTask],
  asyncMiddleware(async (req, res) => {
    const { error } = validateTask(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = req.user;
    const task = req.task;
    // if (!task.isAdmin(user._id))
    //   return res.status(403).send("You are NOT authorized to edit this task.");
    task.setTask(req.body);
    await task.save();
    res.send(task);
  })
);

router.delete(
  "/:taskId",
  [auth, paramTeam, inTeam, paramProject, paramTask],
  asyncMiddleware(async (req, res) => {
    const user = req.user;
    const task = req.task;
    // if (!task.isAdmin(user._id))
    //   return res
    //     .status(403)
    //     .send("You are NOT authorized to delete this task.");
    task.deleteTask();
    await task.save();
    res.send(task);
  })
);
module.exports = router;
