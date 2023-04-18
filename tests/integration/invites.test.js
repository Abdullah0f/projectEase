const request = require("supertest");
const { User } = require("../../models/user");
const { Team } = require("../../models/team");
const { Invite } = require("../../models/invite");
const mongoose = require("mongoose");
const { user: u1, user2: u2, user3: u3 } = require("./constants");
let server;
describe("Invites", () => {
  let user;
  let user2;
  let user3;
  let team;
  let team2;
  let invite1;
  let invite2;

  const validId = new mongoose.Types.ObjectId().toHexString();
  beforeAll(async () => {
    server = require("../../index");
    user = await new User(u1).save();
    user2 = await new User(u2).save();
    user3 = await new User(u3).save();

    team = await new Team({
      name: "team1",
      owner: user._id,
      members: [user._id],
    }).save();
    team2 = await new Team({
      name: "team2",
      owner: user2._id,
      members: [user2._id],
    }).save();
    invite1 = await new Invite({
      email: user2.email,
      team: team._id,
      createdBy: user._id,
    }).save();
    invite2 = await new Invite({
      email: user.email,
      team: team2._id,
      createdBy: user2._id,
    }).save();
  });
  afterAll(async () => {
    await User.deleteMany({});
    await Team.deleteMany({});
    await Invite.deleteMany({});
    await server.close();
  });
  describe("GET /api/teams/:teamId/invites", () => {
    const exec = (id, u = user) => {
      return request(server)
        .get("/api/teams/" + team._id + "/invites" + (id ? "/" + id : ""))
        .set("x-auth-token", u.generateAuthToken())
        .send();
    };
    it("should return all invites", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body.some((i) => i.email === invite1.email)).toBeTruthy();
    });
    it("should paginate invites", async () => {
      const res = await exec().query({ page: 2, limit: 1 });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
    it("should return 404 if no invite for this id", async () => {
      const res = await exec(validId);
      expect(res.status).toBe(404);
    });
    it("should return 400 if invite doesnt belong to this team", async () => {
      const res = await exec(invite2._id);
      expect(res.status).toBe(400);
    });
    it("should return 400 if invite doesnt belong to this user or not in the team", async () => {
      const res = await exec(invite1._id, user3);
      expect(res.status).toBe(403);
    });
    it("should return 200 and the invite if valid", async () => {
      const res = await exec(invite1._id);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe(invite1.email);
    });
  });
  describe("POST /api/teams/:teamId/invites", () => {
    const exec = async (invite) => {
      return request(server)
        .post("/api/teams/" + team._id + "/invites")
        .set("x-auth-token", user.generateAuthToken())
        .send(invite);
    };
    it("should return 400 if email is invalid", async () => {
      const res = await exec({ email: "invalidEmail" });
      expect(res.status).toBe(400);
    });
    it("should return 400 if email is already in the team", async () => {
      const res = await exec({ email: user.email });
      expect(res.status).toBe(400);
    });
    it("should return 400 if email is already invited", async () => {
      const res = await exec({ email: user2.email });
      expect(res.status).toBe(400);
    });
    it("should return 400 if no user with such email", async () => {
      const res = await exec({ email: "xxx@yyy.com" });
      expect(res.status).toBe(400);
    });
    it("should return 200 and the invite if valid", async () => {
      const res = await exec({ email: user3.email });
      expect(res.status).toBe(200);
    });
  });
  describe("DELETE /api/teams/:teamId/invites/:inviteId", () => {
    const exec = async (id) => {
      return request(server)
        .delete("/api/teams/" + team._id + "/invites/" + id)
        .set("x-auth-token", user.generateAuthToken())
        .send();
    };
    it("should return 404 if no invite for this id", async () => {
      const res = await exec(validId);
      expect(res.status).toBe(404);
    });
    it("should return 400 if invite doesnt belong to this team", async () => {
      const res = await exec(invite2._id);
      expect(res.status).toBe(400);
    });
    it("should return 200 and delete the invite if valid", async () => {
      const res = await exec(invite1._id);
      expect(res.status).toBe(200);
      const invite = await Invite.findById(invite1._id);
      expect(invite.isDeleted).toBeTruthy();
      expect(invite.status).toBe("Deleted");
      await invite.restore();
    });
  });
  describe("POST /api/teams/:teamId/invites/:inviteId", () => {
    const exec = async (id, status, u = user2) => {
      return request(server)
        .post("/api/teams/" + team._id + "/invites/" + id)
        .set("x-auth-token", u.generateAuthToken())
        .send(status);
    };
    it("should return 404 if no invite for this id", async () => {
      const res = await exec(validId);
      expect(res.status).toBe(404);
    });
    it("should return 400 if invite doesnt belong to this team", async () => {
      const res = await exec(invite2._id);
      expect(res.status).toBe(400);
    });
    it("should return 403 if other user (even if in team) POST", async () => {
      const res = await exec(invite1._id, { status: "Accepted" }, user);
      expect(res.status).toBe(403);
    });
    it("should return 403 if other user (out of team) POST", async () => {
      const res = await exec(invite1._id, { status: "Accepted" }, user3);
      expect(res.status).toBe(403);
    });
    it("should return 200 and decline the invite if valid and Declined passed and don't add to team", async () => {
      const res = await exec(invite1._id, { status: "Declined" });
      expect(res.status).toBe(200);
      const invite = await Invite.findById(invite1._id);
      const team = await Team.findById(invite1.team);
      expect(team.isMember(user2._id)).toBeFalsy();
      expect(invite.status).toBe("Declined");
      await invite.restore();
    });
    it("should return 200 and accept the invite if valid and Accepted passed and add to team", async () => {
      const res = await exec(invite1._id, { status: "Accepted" });
      expect(res.status).toBe(200);
      const invite = await Invite.findById(invite1._id);
      const team = await Team.findById(invite1.team);
      expect(team.isMember(user2._id)).toBeTruthy();
      expect(invite.status).toBe("Accepted");
      await team.removeMember(user2._id);
      await invite.restore();
    });
    it("should return 200 and delete the invite if valid and Deleted passed", async () => {
      const res = await exec(invite1._id, { status: "Deleted" });
      expect(res.status).toBe(200);
      const invite = await Invite.findById(invite1._id);
      expect(invite.isDeleted).toBeTruthy();
      expect(invite.status).toBe("Deleted");
      await invite.restore();
    });
    it("should return 400 if status is invalid", async () => {
      const res = await exec(invite1._id, { status: "invalid" });
      expect(res.status).toBe(400);
    });
    it("should return 400 if invite is already answerd", async () => {
      const res = await exec(invite1._id, { status: "Accepted" });
      expect(res.status).toBe(200);
      const res2 = await exec(invite1._id, { status: "Declined" });
      expect(res2.status).toBe(400);
      const invite = await Invite.findById(invite1._id);
      expect(invite.status).toBe("Accepted");
      await invite.restore();
    });
  });
});
