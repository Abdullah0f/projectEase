const router = require("express").Router();
const { User } = require("../models/user");
const asyncMiddleware = require("../middleware/async");
const Joi = require("joi");
const bcrypt = require("bcrypt");

router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    if (!(req.body.username || req.body.email))
      return res.status(400).send("no email or username provided");
    const user =
      (await User.findOne({ email: req.body.email })) ||
      (await User.findOne({ username: req.body.username }));
    if (!user)
      return res.status(400).send("Invalid email/username or password.");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(401).send("Invalid email/username or password");

    const token = user.generateAuthToken();
    res.header("x-auth-token", token).send(token);
  })
);
function validate(req) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50),
    email: Joi.string().min(5).max(255),
    password: Joi.string().min(5).max(255).required(),
  })
    .xor("username", "email")
    .required();
  return schema.validate(req);
}
module.exports = router;
