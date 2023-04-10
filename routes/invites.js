const router = require("express").Router({ mergeParams: true });
const { Invite, validateInvite } = require("../models/invite");
const { User } = require("../models/user");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const paramTeam = require("../middleware/paramTeam");
const inTeam = require("../middleware/inTeam");
const paramInvite = require("../middleware/paramInvite");

// api/teams/:teamId/invites
router.get(
  "/",
  [auth, paramTeam, inTeam],
  asyncMiddleware(async (req, res) => {
    const invites = await Invite.find({ team: req.team._id }).sort("name");
    res.send(invites);
  })
);

// api/teams/:teamId/invites/:inviteId
router.get(
  "/:inviteId",
  [auth, paramTeam, inTeam, paramInvite],
  asyncMiddleware(async (req, res) => {
    const invite = req.invite;
    res.send(invite);
  })
);

// api/teams/:teamId/invites
router.post(
  "/",
  [auth, paramTeam, inTeam],
  asyncMiddleware(async (req, res) => {
    const { error } = validateInvite(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const createdBy = req.user._id;
    const team = req.team;
    const email = req.body.email;
    //find user with this email
    const invited = await User.findOne({ email: email });
    console.log("invited", invited);
    if (!invited) return res.status(400).send("no user with this email");
    if (team.isMember(invited._id))
      return res.status(400).send("User is already a member of this team");
    if (await Invite.isInvited(invited.email, team._id))
      return res.status(400).send("User is already invited to this team");

    console.log("invite", email);
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
  [auth, paramTeam, inTeam, paramInvite],
  asyncMiddleware(async (req, res) => {
    switch (req.body.status) {
      case "Accepted":
        await req.invite.accept();
        break;
      case "Declined":
        await req.invite.decline();
        break;
      case "Deleted":
        await req.invite.delete();
        break;
      default:
        return res
          .status(400)
          .send(
            "Status is required and must be Accepted, Declined or Deleted."
          );
    }
    res.send(req.Invite);
  })
);

// api/teams/:teamId/invites/:inviteId
router.delete(
  "/:inviteId",
  [auth, paramTeam, inTeam, paramInvite],
  asyncMiddleware(async (req, res) => {
    await req.invite.delete();
    res.send(req.invite);
  })
);

module.exports = router;
