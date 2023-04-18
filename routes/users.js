const router = require("express").Router();
const { User, validateUser } = require("../models/user");
const asyncMiddleware = require("../middleware/async");
const bcrypt = require("bcrypt");
const paramUser = require("../middleware/paramUser");
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const users = await User.find({ isDeleted: false })
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort("name");
    res.send(users);
  })
);
router.get(
  "/:userId",
  paramUser,
  asyncMiddleware(async (req, res) => {
    const user = req.paramUser;
    // delete sensitive data;
    user.password = undefined;
    res.send(user);
  })
);
router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      dob: req.body.dob,
    });

    await user.save();
    // delete sensitive data;
    delete user.password;
    res.set("x-auth-token", user.generateAuthToken()).send(user);
  })
);

router.put(
  "/:userId",
  paramUser,
  asyncMiddleware(async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = req.paramUser;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    user.set({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      dob: req.body.dob,
    });
    await user.save();

    res.send(user);
  })
);

router.delete(
  "/:userId",
  paramUser,
  asyncMiddleware(async (req, res) => {
    const user = req.paramUser;
    const teams = user.getTeams();
    if (teams.length) {
      for (let team of teams) {
        if (team.isOwner(user._id)) team.changeOwner();
        else team.removeMember(user._id);
      }
    }

    user.deleteUser();
    await user.save();
    res.send(user);
  })
);
module.exports = router;
