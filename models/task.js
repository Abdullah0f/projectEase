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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
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
});

const Task = mongoose.model("Task", taskSchema);

function validateTask(task) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).default("Task Name"),
    description: Joi.string().min(3).max(1024).default("Task Description"),
    owner: Joi.objectId(),
  });
  return schema.validate(task);
}
