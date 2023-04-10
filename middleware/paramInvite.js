const { Invite } = require("../models/invite");
const mongoose = require("mongoose");

module.exports = async function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.inviteId))
    return res.status(400).send("invalid invite ID.");

  const paramInvite = await Invite.findById(req.params.inviteId);

  if (!paramInvite)
    return res.status(404).send("The invite with the given ID was not found.");

  if (paramInvite.team.toString() !== req.team._id.toString())
    return res.status(400).send("This invite does not belong to this team.");

  // if (paramInvite.email !== req.user.email)
  //   return res.status(400).send("This invite does not belong to you.");

  if (paramInvite.isDeleted)
    return res.status(400).send("This invite is already deleted.");

  req.invite = paramInvite;
  next();
};
