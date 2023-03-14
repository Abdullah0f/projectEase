const router = require("express").Router({ mergeParams: true });
const { Team } = require("../models/team");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const isTeam = require("../middleware/isTeam");
const { User } = require("../models/user");

router.get(
  "/",
  [isTeam],
  asyncMiddleware(async (req, res) => {
    const team = req.team;
    const members = await User.find({ _id: { $in: team.members } });
    if (!members.length)
      return res.status(404).send("No members found for this team.");
    res.send(members);
  })
);
router.post(
  "/",
  [auth, isTeam],
  asyncMiddleware(async (req, res) => {
    const team = req.team;
    const newUser = await User.findById(req.body.userId);
    if (!newUser) return res.status(404).send("user you want to add not found");
    if (team.members.includes(newUser._id))
      return res
        .status(400)
        .send("This user is already a member of this team.");
    if (!team.members.includes(req.user._id))
      return res.status(403).send("You are NOT authorized to edit this team.");
    team.addMember(newUser._id);
    await team.save();
    res.send(team.members);
  })
);

router.delete(
  "/:userId",
  [auth, isTeam],
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.params.userId);
    const team = req.team;
    if (!user) return res.status(404).send("user you want to delete not found");
    if (!team.members.includes(req.user._id))
      return res.status(403).send("You are NOT authorized to edit this team.");
    if (!team.members.includes(user._id))
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
