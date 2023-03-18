const { Team } = require("../../models/team");
const { User } = require("../../models/user");
const { Project } = require("../../models/project");
const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const { user: u1, user2: u2 } = require("./constants");
let server;

describe("Projects", () => {
  let user;
  let user2;
  let team;
  let project1;
  let project2;
  const validId = new mongoose.Types.ObjectId().toHexString();
  beforeAll(async () => {
    server = require("../../index");
    user = await new User(u1).save();
    user2 = await new User(u2).save();
    team = await new Team({
      name: "team1",
      owner: user._id,
      members: [user._id],
    }).save();
    project1 = await new Project({
      name: "project1",
      description: "description1",
      createdBy: user._id,
      team: team._id,
    }).save();
    project2 = await new Project({
      name: "project2",
      description: "description2",
      createdBy: user._id,
      team: team._id,
    }).save();
  });
  afterAll(async () => {
    await User.deleteMany({});
    await Team.deleteMany({});
    await Project.deleteMany({});
    await server.close();
  });
  describe("GET /projects", () => {
    const exec = (id) => {
      return request(server)
        .get("/api/teams/" + team._id + "/projects" + (id ? "/" + id : ""))
        .set("x-auth-token", user.generateAuthToken());
    };
    it("should return all projects", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((t) => t.name === "project1")).toBeTruthy();
      expect(res.body.some((t) => t.name === "project2")).toBeTruthy();
    });
    it("should return 400 if invalid id is passed", async () => {
      const res = await exec("1");
      expect(res.status).toBe(400);
    });
    it("should return 404 if no project with the given id exists", async () => {
      const res = await exec(validId);
      expect(res.status).toBe(404);
    });
    it("should return a project if valid id is passed", async () => {
      const res = await exec(project1._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "project1");
    });
  });
  describe("POST /projects", () => {
    const exec = (token, project) => {
      return request(server)
        .post("/api/teams/" + team._id + "/projects")
        .set(token ? "x-auth-token" : "x-x", token || "y")
        .send(project);
    };
    it("should return 401 if client is not logged in", async () => {
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("should return 400 if project is invalid", async () => {
      const res = await exec(user.generateAuthToken(), { name: "1" });
      expect(res.status).toBe(400);
    });
    it("should return 404 if team is not found", async () => {
      const res = await request(server)
        .post("/api/teams/" + validId + "/projects")
        .set("x-auth-token", user.generateAuthToken())
        .send({ name: "project3" });
      expect(res.status).toBe(404);
    });
    it("should return 403 if user is not a member of the team", async () => {
      const res = await exec(user2.generateAuthToken(), { name: "project3" });
      expect(res.status).toBe(403);
    });
    it("should save the project if it is valid", async () => {
      const res = await exec(user.generateAuthToken(), { name: "project3" });
      const project = await Project.find({ name: "project3" });
      expect(res.status).toBe(200);
      expect(project).not.toBeNull();
    });
    it("should return the project if it is valid", async () => {
      const res = await exec(user.generateAuthToken(), { name: "project4" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "project4");
    });
  });
  describe("PUT /projects/:id", () => {
    const exec = (id, token, project) => {
      const p = project || { name: "project8" };
      return request(server)
        .put(`/api/teams/${team.id}/projects/${id}`)
        .set(token ? "x-auth-token" : "x-x", token || "y")
        .send(p);
    };
    it("should return 401 if client is not logged in", async () => {
      const res = await exec(project1._id);
      expect(res.status).toBe(401);
    });
    it("should return 400 if project is invalid", async () => {
      const res = await exec(project1._id, user.generateAuthToken(), {
        name: "1",
      });
      expect(res.status).toBe(400);
    });
    it("should return 404 if project is not found", async () => {
      const res = await exec(validId, user.generateAuthToken());
      expect(res.status).toBe(404);
    });
    it("should return 403 if user is not a member of the team", async () => {
      const res = await exec(project1._id, user2.generateAuthToken());
      expect(res.status).toBe(403);
    });
    it("should return 200 if project is valid and save changes", async () => {
      const res = await exec(project1._id, user.generateAuthToken());
      const project = await Project.findById(project1._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "project8");
      expect(project).toHaveProperty("name", "project8");
    });
  });
  describe("DELETE /projects/:id", () => {
    const exec = (id, token) => {
      return request(server)
        .delete(`/api/teams/${team.id}/projects/${id}`)
        .set(token ? "x-auth-token" : "x-x", token || "y");
    };
    it("should return 401 if client is not logged in", async () => {
      const res = await exec(project1._id);
      expect(res.status).toBe(401);
    });
    it("should return 400 if project is invalid", async () => {
      const res = await exec("1", user.generateAuthToken());
      expect(res.status).toBe(400);
    });
    it("should return 404 if project is not found", async () => {
      const res = await exec(validId, user.generateAuthToken());
      expect(res.status).toBe(404);
    });
    it("should return 403 if user is not a member of the team", async () => {
      const res = await exec(project1._id, user2.generateAuthToken());
      expect(res.status).toBe(403);
    });
    it("should return 200 if project is valid and delete it and save changes", async () => {
      const res = await exec(project1._id, user.generateAuthToken());
      const project = await Project.findById(project1._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name");
      expect(res.body).toHaveProperty("isDeleted", true);
      expect(res.body.isDeleted).toBeTruthy();
      expect(project).toHaveProperty("isDeleted", true);
      expect(project.isDeleted).toBeTruthy();
    });
  });
});
