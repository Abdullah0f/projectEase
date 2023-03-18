module.exports = async function (req, res, next) {
  if (!req.team.isMember(req.user._id))
    return res.status(403).send("You are NOT authorized to edit this team.");
  next();
};
