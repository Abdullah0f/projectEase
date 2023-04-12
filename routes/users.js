const router = require("express").Router();
const { User, validateUser } = require("../models/user");
const asyncMiddleware = require("../middleware/async");
const bcrypt = require("bcrypt");
const paramUser = require("../middleware/paramUser");
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    let users = await User.find().sort("name");
    // filter deleted users
    users = users.filter((user) => {
      if (user.isDeleted) return false;
      else {
        //delete sensitive data
        delete user.password;
        return true;
      }
    });
    res.send(users);
  })
);
router.get(
  "/:userId",
  paramUser,
  asyncMiddleware(async (req, res) => {
    const user = req.paramUser;
    // delete sensitive data;
    delete user.password;
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
    user.deleteUser();
    await user.save();
    res.send(user);
  })
);
module.exports = router;
