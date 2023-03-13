const router = require("express").Router();
const { Team, validateTeam } = require("../models/team");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const { User } = require("../models/user");
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const teams = await Team.find().sort("name");
    if (!teams.length) return res.status(404).send("No teams found.");
    res.send(teams);
  })
);

router.get(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const team = await Team.findById(req.params.id);
    if (!team)
      return res.status(404).send("The team with the given ID was not found.");
    if (team.isDeleted)
      return res.status(400).send("This team is already deleted.");
    res.send(team);
  })
);

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validateTeam(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const owner = await User.findById(req.user._id);
    if (!owner) return res.status(400).send("Invalid user.");
    const members = [owner._id];
    const team = new Team({
      name: req.body.name,
      description: req.body.description,
      members,
      owner: owner._id,
    });
    await team.save();
    res.send(team);
  })
);

router.put(
  "/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validateTeam(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Invalid user.");

    const team = await Team.findById(req.params.id);
    if (!team)
      return res.status(404).send("The team with the given ID was not found.");

    if (team.isDeleted)
      return res.status(400).send("This team is already deleted.");
    if (!team.members.some((x) => x._id == user._id))
      return res.status(400).send("You are authorized to edit this team.");

    team.name = req.body.name;
    team.description = req.body.description;
    await team.save();

    res.send(team);
  })
);

router.delete(
  "/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const team = await Team.findById(req.params.id);
    if (!team)
      return res.status(404).send("The team with the given ID was not found.");
    if (team.isDeleted)
      return res.status(400).send("This team is already deleted.");
    console.log(team.members);
    console.log(req.user._id);

    if (!team.members.some((x) => x._id == req.user._id))
      return res.status(400).send("You are authorized to edit this team.");
    team.isDeleted = true;
    await team.save();
    res.send(team);
  })
);

module.exports = router;
