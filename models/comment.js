const mongoose = require("mongoose");
const Joi = require("joi");

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 1024,
    default: "Comment Text",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
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

commentSchema.methods.delete = function () {
  this.isDeleted = true;
  this.deletedAt = Date.now();
};

commentSchema.methods.restore = function () {
  this.isDeleted = false;
  this.deletedAt = undefined;
};
commentSchema.methods.set = function (comment) {
  this.text = comment.text || this.text;
  this.updatedAt = Date.now();
};

const Comment = mongoose.model("Comment", commentSchema);

function validateComment(comment) {
  const schema = Joi.object({
    text: Joi.string().min(1).max(1024).required(),
    task: Joi.objectId(),
    project: Joi.objectId(),
  });
  return schema.validate(comment);
}

exports.Comment = Comment;
exports.validateComment = validateComment;
