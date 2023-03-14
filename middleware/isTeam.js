const { Team } = require("../models/team");
module.exports = async function (req, res, next) {
  const team = await Team.findById(req.params.teamId);
  if (!team)
    return res.status(404).send("The team with the given ID was not found.");
  if (team.isDeleted)
    return res.status(400).send("This team is already deleted.");
  req.team = team;
  next();
};
