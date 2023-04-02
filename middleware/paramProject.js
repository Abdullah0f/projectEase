const { Project } = require("../models/project");
const mongoose = require("mongoose");
module.exports = async function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.projectId))
    return res.status(400).send("invalid project ID.");
  const paramProject = await Project.findById(req.params.projectId);
  if (!paramProject)
    return res.status(404).send("The project with the given ID was not found.");
  //check if project belongs to this team
  if (paramProject.team.toString() !== req.team._id.toString())
    return res.status(400).send("This project does not belong to this team.");

  req.project = paramProject;
  next();
};
