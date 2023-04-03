const router = require("express").Router({ mergeParams: true });
const { Comment, validateComment } = require("../models/comment");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const paramProject = require("../middleware/paramProject.js");
const paramComment = require("../middleware/paramComment.js");
const isTeam = require("../middleware/isTeam");
const inTeam = require("../middleware/inTeam");

// api/teams/:teamId/projects/:projectId/comments
router.get(
  "/",
  [auth, isTeam, inTeam, paramProject],
  asyncMiddleware(async (req, res) => {
    const comments = await Comment.find({ project: req.project._id }).sort(
      "name"
    );
    res.send(comments);
  })
);

// api/teams/:teamId/projects/:projectId/comments/:commentId
router.get(
  "/:commentId",
  [auth, isTeam, inTeam, paramProject, paramComment],
  asyncMiddleware(async (req, res) => {
    const comment = req.comment;
    res.send(comment);
  })
);

// api/teams/:teamId/projects/:projectId/comments
router.post(
  "/",
  [auth, isTeam, inTeam, paramProject],
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
  [auth, isTeam, inTeam, paramProject, paramComment],
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
  [auth, isTeam, inTeam, paramProject, paramComment],
  asyncMiddleware(async (req, res) => {
    const comment = req.comment;
    comment.remove();
    await comment.save();
    res.send(comment);
  })
);

module.exports = router;
