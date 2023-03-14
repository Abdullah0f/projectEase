let server;
const { Team } = require("../../models/team");
const request = require("supertest");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
describe("Teams", () => {
  let user;
  beforeAll(async () => {
    server = require("../../index");
    user = await new User({
      username: "abc",
      email: "abc@example.com",
      password: "12345",
    }).save();
  });
  afterAll(async () => {
    await User.deleteMany({});
    await server.close();
  });
  describe("GET /teams", () => {
    const validId = new mongoose.Types.ObjectId().toHexString();
    beforeAll(async () => {
      await new Team({ _id: validId, name: "team1", owner: user._id }).save();
      await new Team({ name: "team2", owner: user._id }).save();
    });
    afterAll(async () => {
      await Team.deleteMany({});
    });
    const exec = (id) => {
      return request(server).get("/api/teams" + (id ? "/" + id : ""));
    };
    it("should return all teams", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((t) => t.name === "team1")).toBeTruthy();
      expect(res.body.some((t) => t.name === "team2")).toBeTruthy();
    });
    it("should return a team if valid id is passed", async () => {
      const res = await exec(validId);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "team1");
    });
    it("should return 400 if invalid id is passed", async () => {
      const res = await exec("1");
      expect(res.status).toBe(400);
    });
    it("should return 404 if no team with the given id exists", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const res = await exec(id);
      expect(res.status).toBe(404);
    });
  });
  describe("POST /teams", () => {
    const exec = (token, team) => {
      team = team || {
        name: "team1",
        description: "description",
      };
      return request(server)
        .post("/api/teams")
        .set(token ? "x-auth-token" : "x-xx", token || "yy")
        .send(team);
    };
    afterAll(async () => {
      await Team.deleteMany({});
    });
    it("should return 401 if client is not logged in", async () => {
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("should return 404 if no user found with id", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const token = jwt.sign({ _id: id }, config.get("jwtPrivateKey"));
      const res = await exec(token);
      expect(res.status).toBe(404);
    });
    it("should return 400 if team name is invalid", async () => {
      const res = await exec(user.generateAuthToken(), { name: "a" });
      expect(res.status).toBe(400);
    });
    it("should return 400 if team description is invalid", async () => {
      const res = await exec(user.generateAuthToken(), {
        name: "team1",
        description: "a",
      });
      expect(res.status).toBe(400);
    });
    it("should return 200, save and return the team if it is valid and user is authintcated", async () => {
      const res = await exec(user.generateAuthToken());
      const team = await Team.findById(res.body._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "team1");
      expect(res.body).toHaveProperty("owner", user._id.toHexString());
      expect(team).not.toBeNull();
      expect(team).toHaveProperty("name", "team1");
    });
  });
  describe("PUT /teams/:id", () => {
    let team;

    const exec = (token, id) => {
      const team = {
        name: "team2",
        description: "description2",
      };
      return request(server)
        .put("/api/teams/" + id)
        .set(token ? "x-auth-token" : "x-xx", token || "yy")
        .send(team);
    };
    beforeAll(async () => {
      team = await new Team({
        name: "team1",
        description: "description1",
        owner: user._id,
        members: [user._id],
      }).save();
    });
    afterAll(async () => {
      await Team.deleteMany({});
    });

    it("should return 401 if client is not logged in", async () => {
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("should return 404 if no team with the given id exists", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const token = user.generateAuthToken();
      const res = await exec(token, id);
      expect(res.status).toBe(404);
    });
    it("should return 400 if id in invalid", async () => {
      const id = "1";
      const token = user.generateAuthToken();
      const res = await exec(token, id);
      expect(res.status).toBe(400);
    });
    it("should return 401 user is not in the team", async () => {
      const user = await new User({
        username: "qwe",
        email: "qwe@gmail.com",
        password: "12345",
      }).save();
      const token = user.generateAuthToken();
      const res = await exec(token, team._id);
      await User.findByIdAndDelete(user._id);
      expect(res.status).toBe(401);
    });
    it("should return 200, update and return the team if it is valid and user is authintcated", async () => {
      const token = user.generateAuthToken();
      const res = await exec(token, team._id);
      const updatedTeam = await Team.findById(team._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "team2");
      expect(updatedTeam).not.toBeNull();
      expect(updatedTeam).toHaveProperty("name", "team2");
    });
    it("should return 400 if team is deleted", async () => {
      team.isDeleted = true;
      await team.save();
      const token = user.generateAuthToken();
      const res = await exec(token, team._id);
      expect(res.status).toBe(400);
    });
  });
  describe("DELETE /teams/:id", () => {
    let team;
    const exec = (token, id) => {
      return request(server)
        .delete("/api/teams/" + id)
        .set(token ? "x-auth-token" : "x-xx", token || "yy");
    };
    beforeAll(async () => {
      team = await new Team({
        name: "team1",
        description: "description1",
        owner: user._id,
        members: [user._id],
      }).save();
      await new User({});
    });
    afterAll(async () => {
      await Team.deleteMany({});
      await User.deleteMany({});
    });
    it("should return 401 if client is not logged in", async () => {
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("should return 404 if no team with the given id exists", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const token = user.generateAuthToken();
      const res = await exec(token, id);
      expect(res.status).toBe(404);
    });
    it("should return 400 if id invalid", async () => {
      const id = "1";
      const token = user.generateAuthToken();
      const res = await exec(token, id);
      expect(res.status).toBe(400);
    });
    it("should return 401 user is not in the team", async () => {
      const user = await new User({
        username: "qwe",
        email: "qwe@gmail.com",
        password: "12345",
      }).save();
      const token = user.generateAuthToken();
      const res = await exec(token, team._id);
      expect(res.status).toBe(401);
    });
    it("should return 200, delete and return the team if it is valid and user is authintcated", async () => {
      const token = user.generateAuthToken();
      const res = await exec(token, team._id);
      const deletedTeam = await Team.findById(team._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "team1");
      expect(res.body).toHaveProperty("isDeleted", true);
      expect(deletedTeam).not.toBeNull();
      expect(deletedTeam).toHaveProperty("name", "team1");
      expect(deletedTeam).toHaveProperty("isDeleted", true);
    });
  });
});
