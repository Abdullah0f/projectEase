const { Project } = require("../models/project");
const mongoose = require("mongoose");
module.exports = async function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.projectId))
    return res.status(400).send("invalid ID.");
  const paramProject = await Project.findById(req.params.projectId);

  if (!paramProject)
    return res.status(404).send("The user with the given ID was not found.");
  req.paramProject = paramProject;
  next();
};
