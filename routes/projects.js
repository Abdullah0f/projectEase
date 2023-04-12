const router = require("express").Router({ mergeParams: true });
const { Project, validateProject } = require("../models/project");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const paramTeam = require("../middleware/paramTeam");
const inTeam = require("../middleware/inTeam");
const paramProject = require("../middleware/paramProject");

router.get(
  "/",
  [auth, paramTeam, inTeam],
  asyncMiddleware(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const projects = await Project.find({
      team: req.team._id,
      isDeleted: false,
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort("name");
    res.send(projects);
  })
);

router.get(
  "/:projectId",
  [auth, paramTeam, inTeam, paramProject],
  asyncMiddleware(async (req, res) => {
    const project = req.project;
    res.send(project);
  })
);

router.post(
  "/",
  [auth, paramTeam, inTeam],
  asyncMiddleware(async (req, res) => {
    const { error } = validateProject(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const team = req.team;
    const project = new Project({ createdBy: req.user._id, team: team._id });
    project.set(req.body);
    await project.save();
    res.send(project);
  })
);

router.put(
  "/:projectId",
  [auth, paramTeam, inTeam, paramProject],
  asyncMiddleware(async (req, res) => {
    const { error } = validateProject(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const project = req.project;
    project.set(req.body);
    await project.save();
    res.send(project);
  })
);

router.delete(
  "/:projectId",
  [auth, paramTeam, inTeam, paramProject],
  asyncMiddleware(async (req, res) => {
    const project = req.project;
    project.delete();
    await project.save();
    res.send(project);
  })
);

module.exports = router;
