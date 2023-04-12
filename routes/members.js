const router = require("express").Router({ mergeParams: true });
const { Team } = require("../models/team");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const paramTeam = require("../middleware/paramTeam");
const inTeam = require("../middleware/inTeam");
const bodyUser = require("../middleware/bodyUser");
const paramUser = require("../middleware/paramUser");

const { User } = require("../models/user");

router.get(
  "/",
  [paramTeam],
  asyncMiddleware(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const team = req.team;
    const members = await User.find({
      _id: { $in: team.members },
      isDeleted: false,
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort("name");
    res.send(members);
  })
);
router.post(
  "/",
  [auth, paramTeam, inTeam, bodyUser],
  asyncMiddleware(async (req, res) => {
    const team = req.team;
    const newUser = await User.findById(req.body.userId);
    if (!newUser) return res.status(404).send("user not found");
    if (team.isMember(newUser._id))
      return res
        .status(400)
        .send("This user is already a member of this team.");
    team.addMember(newUser._id);
    await team.save();
    res.send(team.members);
  })
);

router.delete(
  "/:userId",
  [auth, paramTeam, inTeam, paramUser],
  asyncMiddleware(async (req, res) => {
    const user = req.paramUser;
    const team = req.team;
    if (!team.isMember(user._id))
      return res.status(400).send("This user is not a member of this team.");
    if (team.members.length === 1)
      return res
        .status(400)
        .send("You cannot delete the last member of a team.");
    team.removeMember(user._id);
    await team.save();

    res.send(team.members);
  })
);
module.exports = router;
