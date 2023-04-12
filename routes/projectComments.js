const router = require("express").Router({ mergeParams: true });
const { Comment, validateComment } = require("../models/comment");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const paramProject = require("../middleware/paramProject.js");
const paramComment = require("../middleware/paramComment.js");
const paramTeam = require("../middleware/paramTeam");
const inTeam = require("../middleware/inTeam");

// api/teams/:teamId/projects/:projectId/comments
router.get(
  "/",
  [auth, paramTeam, inTeam, paramProject],
  asyncMiddleware(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const comments = await Comment.find({
      project: req.project._id,
      isDeleted: false,
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort("name");
    res.send(comments);
  })
);

// api/teams/:teamId/projects/:projectId/comments/:commentId
router.get(
  "/:commentId",
  [auth, paramTeam, inTeam, paramProject, paramComment],
  asyncMiddleware(async (req, res) => {
    const comment = req.comment;
    res.send(comment);
  })
);

// api/teams/:teamId/projects/:projectId/comments
router.post(
  "/",
  [auth, paramTeam, inTeam, paramProject],
  asyncMiddleware(async (req, res) => {
    const { error } = validateComment(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const createdBy = req.user._id;
    const project = req.project;
    const comment = new Comment({
      createdBy: createdBy,
      project: project._id,
    });
    comment.set(req.body);
    await comment.save();
    res.send(comment);
  })
);

// api/teams/:teamId/projects/:projectId/comments/:commentId
router.put(
  "/:commentId",
  [auth, paramTeam, inTeam, paramProject, paramComment],
  asyncMiddleware(async (req, res) => {
    const { error } = validateComment(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = req.user;
    const comment = req.comment;
    comment.set(req.body);
    await comment.save();
    res.send(comment);
  })
);

// api/teams/:teamId/projects/:projectId/comments/:commentId
router.delete(
  "/:commentId",
  [auth, paramTeam, inTeam, paramProject, paramComment],
  asyncMiddleware(async (req, res) => {
    const comment = req.comment;
    comment.remove();
    await comment.save();
    res.send(comment);
  })
);

module.exports = router;
