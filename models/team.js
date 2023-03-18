const mongoose = require("mongoose");
const config = require("config");
const Joi = require("joi");
const { userSchema } = require("./user");
const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    default: "Team Name",
  },
  description: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 1024,
    default: "Team Description",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    required: true,
    default: [this.owner].length ? [this.owner] : [],
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  modfiedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

teamSchema.methods.setTeam = function (team) {
  this.name = team.name;
  this.description = team.description;
  this.owner = this.owner || team.owner;
  this.members = this.members || team.members;
  this.createdAt = this.createdAt || Date.now();
  this.modfiedAt = Date.now();
};

teamSchema.methods.addMember = function (user) {
  this.members.push(user);
};
teamSchema.methods.removeMember = function (user) {
  this.members.splice(this.members.indexOf(user), 1);
};
teamSchema.methods.deleteTeam = function () {
  this.isDeleted = true;
  this.dateDeleted = Date.now();
};
teamSchema.methods.updateTeam = function (team) {
  this.name = team.name;
  this.description = team.description;
  this.modfiedAt = Date.now();
};
teamSchema.methods.isMember = function (user) {
  return this.members.includes(user);
};
const Team = mongoose.model("Team", teamSchema);
function validateTeam(team) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).default("Team Name"),
    description: Joi.string().min(3).max(1024).default("Team Description"),
    owner: Joi.objectId(),
    members: Joi.array().items(Joi.objectId()),
  });
  return schema.validate(team);
}
exports.Team = Team;
exports.validateTeam = validateTeam;
