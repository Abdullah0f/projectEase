const mongoose = require("mongoose");
const Joi = require("joi");
const { Team } = require("./team");
const { User } = require("./user");

const inviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Accepted", "Declined", "Deleted"],
    default: "Pending",
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
});

inviteSchema.methods.accept = async function () {
  //create transaction
  const user = await User.findOne({ email: this.email });
  const team = await Team.findById(this.team);
  team.addMember(user);
  await team.save();
  this.status = "Accepted";
  this.isDeleted = true;
  this.deletedAt = Date.now();
  await this.save();
};

inviteSchema.methods.decline = async function () {
  this.status = "Declined";
  this.isDeleted = true;
  this.deletedAt = Date.now();
  await this.save();
};
inviteSchema.methods.delete = async function () {
  this.status = "Deleted";
  this.isDeleted = true;
  this.deletedAt = Date.now();
  await this.save();
};
inviteSchema.methods.restore = async function () {
  this.status = "Pending";
  this.isDeleted = false;
  this.deletedAt = null;
  await this.save();
};
//create static method to search for invite by email and team
inviteSchema.statics.findByEmailAndTeam = function (email, team) {
  return this.findOne({ email: email, team: team });
};

inviteSchema.statics.isInvited = async function (email, team) {
  const invite = await this.findByEmailAndTeam(email, team);
  return invite ? true : false;
};

const Invite = mongoose.model("Invite", inviteSchema);

function validateInvite(invite) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
  });
  return schema.validate(invite);
}

exports.Invite = Invite;
exports.validateInvite = validateInvite;
