const router = require("express").Router();
const { User, validateUser } = require("../models/user");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const users = await User.find().sort("name");
    if (!users.length) return res.status(404).send("No users found.");
    res.send(users);
  })
);
router.get(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).send("The user with the given ID was not found.");
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
  "/:id",
  asyncMiddleware(async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        dob: req.body.dob,
      },
      { new: true }
    );

    if (!user)
      return res.status(404).send("The user with the given ID was not found.");

    res.send(user);
  })
);

router.delete(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user)
      return res.status(404).send("The user with the given ID was not found.");
    res.send(user);
  })
);
module.exports = router;
