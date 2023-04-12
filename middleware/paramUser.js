const { User } = require("../models/user");
const mongoose = require("mongoose");
module.exports = async function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId))
    return res.status(400).send("invalid ID.");
  const paramUser = await User.findById(req.params.userId);

  if (!paramUser)
    return res.status(404).send("The user with the given ID was not found.");
  if (paramUser.isDeleted) return res.status(404).send("This user is deleted.");
  req.paramUser = paramUser;
  next();
};
