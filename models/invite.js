const mongoose = require("mongoose");
const Joi = require("joi");

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
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Accepted", "Declined", "Cancelled"],
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

inviteSchema.methods.accept = function () {
  this.status = "Accepted";
  this.isDeleted = true;
  this.deletedAt = Date.now();
};

inviteSchema.methods.decline = function () {
  this.status = "Declined";
  this.isDeleted = true;
  this.deletedAt = Date.now();
};
inviteSchema.methods.delete = function () {
  this.status = "Cancelled";
  this.isDeleted = true;
  this.deletedAt = Date.now();
};
const Invite = mongoose.model("Invite", inviteSchema);

function validateInvite(invite) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    team: Joi.objectId().required(),
  });
  return schema.validate(invite);
}

exports.Invite = Invite;
exports.validateInvite = validateInvite;
