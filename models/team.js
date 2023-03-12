const mongoose = require("mongoose");
const config = require("config");
const Joi = require("joi");
const { User } = require("./user");
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
    type: User,
    required: true,
  },
  members: {
    type: [User],
    required: true,
    default: [this.owner],
  },
  dateCreated: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dateDeleted: {
    type: Date,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});
teamSchema.methods.addMember = function (user) {
  this.members.push(user);
};
teamSchema.methods.removeMember = function (user) {
  this.members = this.members.filter((m) => m._id !== user._id);
};
teamSchema.methods.deleteTeam = function () {
  this.isDeleted = true;
  this.dateDeleted = Date.now();
};
const Team = mongoose.model("Team", teamSchema);
function validateTeam(team) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().min(3).max(1024),
    owner: Joi.objectId(),
    members: Joi.array().items(Joi.objectId()),
  });
  return schema.validate(team);
}
exports.Team = Team;
exports.validate = validateTeam;
