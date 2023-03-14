const router = require("express").Router();
const { User, validateUser } = require("../models/user");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const paramUser = require("../middleware/paramUser");
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const users = await User.find().sort("name");
    if (!users.length) return res.status(404).send("No users found.");
    res.send(users);
  })
);
router.get(
  "/:userId",
  paramUser,
  asyncMiddleware(async (req, res) => {
    const user = req.paramUser;
    res.send(user);
  })
);
router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = new User({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      dob: req.body.dob,
    });
    await user.save();
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
    await User.findByIdAndRemove(user._id);
    res.send(user);
  })
);
module.exports = router;
