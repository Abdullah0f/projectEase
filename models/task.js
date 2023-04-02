const mongoose = require("mongoose");
const Joi = require("joi");

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    default: "Task Name",
  },
  description: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 1024,
    default: "Task Description",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  admins: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  status: {
    type: String,
    enum: ["todo", "In Progress", "Done", "Completed", "Cancelled"],
    default: "todo",
  },
  dueDate: {
    type: Date,
  },
  priority: {
    type: Number,
    default: 0,
    enum: [0, 1, 2],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
  },
});

taskSchema.methods.isAdmin = function (userId) {
  return this.admins.includes(userId);
};
//TODO:
// taskSchema.methods.isMember

taskSchema.methods.isOwner = function (userId) {
  return this.createdBy === userId;
};
taskSchema.methods.setTask = function (task) {
  this.name = task.name || this.name;
  this.description = task.description || this.description;
  this.status = task.status || this.status;
  this.priority = task.priority || this.priority;
  this.dueDate = task.dueDate || this.dueDate;
  this.updatedAt = Date.now();
  this.project = task.project || this.project;
};
taskSchema.methods.addAdmin = function (userId) {
  if (!this.isAdmin(userId)) this.admins.push(userId);
};
taskSchema.methods.removeAdmin = function (userId) {
  if (this.isAdmin(userId)) {
    const index = this.admins.indexOf(userId);
    this.admins.splice(index, 1);
  }
};

taskSchema.methods.deleteTask = function () {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  this.status = "Cancelled";
};

const Task = mongoose.model("Task", taskSchema);

function validateTask(task) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).default("Task Name"),
    description: Joi.string().min(3).max(1024).default("Task Description"),
    owner: Joi.objectId(),
  });
  return schema.validate(task);
}

exports.Task = Task;
exports.validate = validateTask;
