const mongoose = require("mongoose");
const Joi = require("joi");
const { Team } = require("./team");
const { teamSchema } = require("./team");
const { userSchema } = require("./user");
const { taskSchema } = require("./task");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    default: "Project Name",
  },
  description: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 1024,
    default: "Description",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  tasks: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Task",
  },
  status: {
    type: String,
    required: true,
    enum: ["Not Started", "In Progress", "Completed", "Cancelled"],
    default: "Not Started",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

projectSchema.methods.delete = function () {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  this.status = "Cancelled";
};

projectSchema.methods.set = function (project) {
  this.name = project.name || this.name;
  this.description = project.description || this.description;
  this.createdBy = this.createdBy || project.createdBy;
  this.team = this.team || project.team;
  this.status = project.status || this.status;
  this.updatedAt = Date.now();
};

projectSchema.methods.addTask = function (task) {
  this.tasks.addToSet(task);
};
projectSchema.methods.removeTask = function (task) {
  this.tasks.pull(task);
};
const Project = mongoose.model("Project", projectSchema);
function validateProject(project) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).default("Project Name"),
    description: Joi.string().min(3).max(1024).default("Project Description"),
    createdBy: Joi.objectId(),
    tasks: Joi.objectId(),
    status: Joi.string()
      .valid("Not Started", "In Progress", "Completed", "Cancelled")
      .default("Not Started"),
  });
  return schema.validate(project);
}

exports.Project = Project;
exports.validateProject = validateProject;
