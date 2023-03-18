const router = require("express").Router({ mergeParams: true });
const { Project, validateProject } = require("../models/project");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const isTeam = require("../middleware/isTeam");
const inTeam = require("../middleware/inTeam");
const paramProject = require("../middleware/paramProject");

router.get(
  "/",
  [auth, isTeam, inTeam],
  asyncMiddleware(async (req, res) => {
    const projects = await Project.find().sort("name");
    if (!projects.length) return res.status(404).send("No projects found.");
    res.send(projects);
  })
);

router.get(
  "/:projectId",
  [auth, isTeam, inTeam, paramProject],
  asyncMiddleware(async (req, res) => {
    const project = req.paramProject;
    res.send(project);
  })
);

router.post(
  "/",
  [auth, isTeam, inTeam],
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
  [auth, isTeam, inTeam, paramProject],
  asyncMiddleware(async (req, res) => {
    const { error } = validateProject(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const project = req.paramProject;
    project.set(req.body);
    await project.save();
    res.send(project);
  })
);

router.delete(
  "/:projectId",
  [auth, isTeam, inTeam, paramProject],
  asyncMiddleware(async (req, res) => {
    const project = req.paramProject;
    project.delete();
    await project.save();
    res.send(project);
  })
);

module.exports = router;
