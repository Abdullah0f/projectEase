const router = require("express").Router({ mergeParams: true });
const { Invite, validateInvite } = require("../models/invite");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const isTeam = require("../middleware/isTeam");
const inTeam = require("../middleware/inTeam");
const paramInvite = require("../middleware/paramInvite");

// api/teams/:teamId/invites
router.get(
  "/",
  [auth, isTeam, inTeam],
  asyncMiddleware(async (req, res) => {
    const invites = await Invite.find({ team: req.team._id }).sort("name");
    res.send(invites);
  })
);

// api/teams/:teamId/invites/:inviteId
router.get(
  "/:inviteId",
  [auth, isTeam, inTeam],
  asyncMiddleware(async (req, res) => {
    const invite = req.invite;
    res.send(invite);
  })
);

// api/teams/:teamId/invites
router.post(
  "/",
  [auth, isTeam, inTeam],
  asyncMiddleware(async (req, res) => {
    const { error } = validateInvite(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const createdBy = req.user._id;
    const team = req.team;
    const email = req.body.email;
    const invite = new Invite({
      createdBy: createdBy,
      team: team._id,
      email: email,
    });
    await invite.save();
    res.send(invite);
  })
);

// api/teams/:teamId/invites/:inviteId
router.post(
  "/:inviteId",
  [auth, isTeam, inTeam, paramInvite],
  asyncMiddleware(async (req, res) => {
    switch (req.body.status) {
      case "Accepted":
        req.Invite.accept();
        break;
      case "Declined":
        req.Invite.decline();
        break;
      case "Cancelled":
        req.Invite.delete();
        break;
      default:
        return res
          .status(400)
          .send(
            "Status is required and must be Accepted, Declined or Cancelled"
          );
    }
    await req.invite.save();
    res.send(req.Invite);
  })
);

// api/teams/:teamId/invites/:inviteId
router.delete(
  "/:inviteId",
  [auth, isTeam, inTeam, paramInvite],
  asyncMiddleware(async (req, res) => {
    await req.invite.delete();
    res.send(req.invite);
  })
);

module.exports = router;
