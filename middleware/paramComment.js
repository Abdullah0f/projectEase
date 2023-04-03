const { Comment } = require("../models/comment");
const mongoose = require("mongoose");
module.exports = async function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.taskId))
    return res.status(400).send("invalid comment ID.");
  const paramComment = await Comment.findById(req.params.commentId);
  if (!paramComment)
    return res.status(404).send("The comment with the given ID was not found.");
  if (paramComment.project.toString() !== req.project._id.toString())
    return res
      .status(400)
      .send("This comment does not belong to this project.");
  if (req.task && paramComment.task.toString() !== req.task._id.toString())
    return res.status(400).send("This comment does not belong to this task.");
  if (paramComment.isDeleted)
    return res.status(400).send("This comment is already deleted.");
  req.comment = paramTask;
  next();
};
