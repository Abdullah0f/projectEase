const router = require("express").Router();
const { User } = require("../models/user");
const asyncMiddleware = require("../middleware/async");
const Joi = require("joi");

router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user =
      (await User.findOne({ email: req.body.email })) ||
      (await User.findOne({ username: req.body.username }));
    if (!user)
      return res.status(400).send("Invalid email/username or password.");
    if (user.password !== req.body.password)
      return res.status(400).send("Invalid email/username or password.");
    const token = user.generateAuthToken();
    res.send(token);
  })
);
function validate(req) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50),
    password: Joi.string().min(5).max(255),
  });
  return schema.validate(req);
}
module.exports = router;
