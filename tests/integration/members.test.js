let server;
const { Team } = require("../../models/team");
const request = require("supertest");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

describe("Members", () => {
  let user;
  let user1;
  let user2;
  let team;
  let path;
  beforeAll(async () => {
    server = require("../../index");
    user = await new User({
      username: "abc",
      email: "abc@example.com",
      password: "12345",
    }).save();
    user1 = await new User({
      username: "xyz",
      email: "xyz@example.com",
      password: "12345",
    }).save();
    user2 = await new User({
      username: "asd",
      email: "asd@example.com",
      password: "12345",
    }).save();
    team = await new Team({
      name: "team1",
      description: "description",
      owner: user._id,
      members: [user._id],
    }).save();
    path = "/api/teams/" + team._id + "/members";
  });
  afterAll(async () => {
    await User.deleteMany({});
    await Team.deleteMany({});
    await server.close();
  });
  describe("GET /:id/members", () => {
    it("should return 200 with all members", async () => {
      const res = await request(server).get(path);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(
        res.body.some((x) => x._id === user._id.toHexString())
      ).toBeTruthy();
    });
  });
  describe("POST /:id/members", () => {
    const exec = (token, member, p) => {
      member = member || { userId: user1._id };
      return request(server)
        .post(p || path)
        .set(token ? "x-auth-token" : "x-xx", token || "xx")
        .send(member);
    };
    afterEach = async () => {
      await Team.findById(team._id).update({
        members: [user._id],
        isDeleted: false,
      });
    };
    it("should return 401 if requester user is not logged in", async () => {
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("should return 403 if requester user is not in the team", async () => {
      const token = user1.generateAuthToken();
      const res = await exec(token);
      expect(res.status).toBe(403);
    });
    it("should return 400 if new user is already in the team", async () => {
      const token = user.generateAuthToken();
      const res = await exec(token, { userId: user._id });
      expect(res.status).toBe(400);
    });
    it("should return 404 if team does not exist", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const token = user.generateAuthToken();
      const path = "/api/teams/" + id + "/members";
      const res = await exec(token, { userId: user1._id }, path);
      expect(res.status).toBe(404);
    });
    it("should reutrn 404 if new user does not exist", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const token = user.generateAuthToken();
      const res = await exec(token, { userId: id });
      expect(res.status).toBe(404);
    });
    it("should return 400 if team is already deleted", async () => {
      const t = await Team.findById(team._id);
      t.isDeleted = true;
      await t.save();
      const token = user.generateAuthToken();
      const res = await exec(token);
      expect(res.status).toBe(400);
      t.isDeleted = false;
      await t.save();
    });
    it("should return 200 if new user is added to the team", async () => {
      const token = user.generateAuthToken();
      const res = await exec(token);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.includes(user1._id.toHexString())).toBeTruthy();
    });
  });
  describe("DELETE /:id/members", () => {
    const exec = (token, p) => {
      return request(server)
        .delete(p || path + "/" + user1._id)
        .set(token ? "x-auth-token" : "x-xx", token || "xx");
    };
    beforeAll(async () => {
      const t = await Team.findById(team._id);
      t.members = [user._id, user1._id];
      await t.save();
    });
    afterAll(async () => {
      const t = await Team.findById(team._id);
      t.members = [user._id];
      await t.save();
    });
    afterEach = async () => {
      console.log("lkjhg");
      await Team.findById(team._id).update({ members: [user._id, user2._id] });
    };
    it("should return 401 if requester user is not logged in", async () => {
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("should return 403 if requester user is not in the team", async () => {
      const token = user2.generateAuthToken();
      const res = await exec(token);
      expect(res.status).toBe(403);
    });
    it("should return 404 if team does not exist", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const token = user.generateAuthToken();
      const path = "/api/teams/" + id + "/members/" + user1._id;
      const res = await exec(token, path);
      expect(res.status).toBe(404);
    });
    it("should reutrn 404 if to be deleted user does not exist", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const token = user.generateAuthToken();
      const res = await exec(token, path + "/" + id);
      expect(res.status).toBe(404);
    });
    it("should return 400 if team is already deleted", async () => {
      const t = await Team.findById(team._id);
      t.isDeleted = true;
      await t.save();
      const token = user.generateAuthToken();
      const res = await exec(token);
      expect(res.status).toBe(400);
      t.isDeleted = false;
      await t.save();
    });
    it("should return 200 if user is deleted from the team", async () => {
      const token = user.generateAuthToken();
      const res = await exec(token);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body.includes(user1._id.toHexString())).toBeFalsy();
    });
    it("should return 400 if last member is removed from the team", async () => {
      team.members = [user._id];
      await team.save();
      const token = user.generateAuthToken();
      const res = await exec(token, path + "/" + user._id);
      expect(res.status).toBe(400);
    });
  });
});
