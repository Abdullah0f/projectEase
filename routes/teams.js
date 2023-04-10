const router = require("express").Router();
const { Team, validateTeam } = require("../models/team");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const paramTeam = require("../middleware/paramTeam");
const inTeam = require("../middleware/inTeam");
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const teams = await Team.find().sort("name");
    if (!teams.length) return res.status(404).send("No teams found.");
    res.send(teams);
  })
);

router.get(
  "/:teamId",
  paramTeam,
  asyncMiddleware(async (req, res) => {
    const team = req.team;
    res.send(team);
  })
);

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validateTeam(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const owner = (await User.findById(req.body.owner)) || req.user;
    const members = [owner._id];
    const team = new Team({
      members: members,
      owner: owner._id,
    });
    team.setTeam(req.body);
    await team.save();
    res.send(team);
  })
);

router.put(
  "/:teamId",
  [auth, paramTeam, inTeam],
  asyncMiddleware(async (req, res) => {
    const { error } = validateTeam(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = req.user;
    const team = req.team;

    // if (!team.isMember(user._id))
    //   return res.status(403).send("You are NOT authorized to edit this team.");

    team.setTeam(req.body);

    await team.save();
    res.send(team);
  })
);

router.delete(
  "/:teamId",
  [auth, paramTeam, inTeam],
  asyncMiddleware(async (req, res) => {
    const team = req.team;

    // if (!team.isMember(req.user._id))
    //   return res.status(403).send("You are NOT authorized to edit this team.");
    team.deleteTeam();
    await team.save();
    res.send(team);
  })
);

module.exports = router;
