const request = require("supertest");
const { User } = require("../../models/user");
const { Team } = require("../../models/team");
const { Project } = require("../../models/project");
const { Task } = require("../../models/task");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const { user: u1, user2: u2 } = require("./constants");
let server;
describe("Tasks", () => {
  let user;
  let user2;
  let team;
  let team2;
  let project1;
  let project2;
  let task1;
  let task2;
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
    team2 = await new Team({
      name: "team2",
      owner: user2._id,
      members: [user2._id],
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
    task1 = await new Task({
      name: "task1",
      description: "description1",
      createdBy: user._id,
      project: project1._id,
    }).save();
    task2 = await new Task({
      name: "task2",
      description: "description2",
      createdBy: user._id,
      project: project2._id,
    }).save();
  });
  afterAll(async () => {
    await User.deleteMany({});
    await Team.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});
    await server.close();
  });

  describe("GET /tasks", () => {
    const exec = (id) => {
      return request(server)
        .get(
          "/api/teams/" +
            team._id +
            "/projects/" +
            project1._id +
            "/tasks" +
            (id ? "/" + id : "")
        )
        .set("x-auth-token", user.generateAuthToken());
    };
    it("should return all tasks for this project", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body.some((t) => t.name === "task1")).toBeTruthy();
      expect(res.body.some((t) => t.name === "task2")).toBeFalsy();
    });
    it("should return 400 if invalid id is passed", async () => {
      const res = await exec("1");
      expect(res.status).toBe(400);
    });
    it("should return 404 if no task with the given id exists", async () => {
      const res = await exec(validId);
      expect(res.status).toBe(404);
    });
    it("should return 404 if no project with the given id exists", async () => {
      const res = await request(server)
        .get("/api/teams/" + team._id + "/projects/" + validId + "/tasks")
        .set("x-auth-token", user.generateAuthToken());
      expect(res.status).toBe(404);
    });
    it("should return 404 if no team with the given id exists", async () => {
      const res = await request(server)
        .get("/api/teams/" + validId + "/projects/" + project1._id + "/tasks")
        .set("x-auth-token", user.generateAuthToken());
      expect(res.status).toBe(404);
    });
    it("should return a task if valid id is passed", async () => {
      const res = await exec(task1._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", task1.name);
    });
    it("should return 400 if task does not belong to this project", async () => {
      const res = await exec(task2._id);
      expect(res.status).toBe(400);
    });
  });
});
