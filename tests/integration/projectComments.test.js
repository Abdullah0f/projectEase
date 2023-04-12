const request = require("supertest");
const { User } = require("../../models/user");
const { Team } = require("../../models/team");
const { Project } = require("../../models/project");
const { Comment } = require("../../models/comment");
const mongoose = require("mongoose");
const { user: u1, user2: u2 } = require("./constants");
let server;

describe("projectComments", () => {
  let user;
  let user2;
  let team;
  let project1;
  let project2;
  let projectComment1;
  let projectComment2;
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
    projectComment1 = await new Comment({
      text: "projectComment1",
      createdBy: user._id,
      project: project1._id,
    }).save();
    projectComment2 = await new Comment({
      text: "projectComment2",
      createdBy: user._id,
      project: project2._id,
    }).save();
  });
  afterAll(async () => {
    await User.deleteMany({});
    await Team.deleteMany({});
    await Project.deleteMany({});
    await Comment.deleteMany({});
    await server.close();
  });

  describe("GET /api/projectComments", () => {
    const exec = (id) => {
      return request(server)
        .get(
          "/api/teams/" +
            team._id +
            "/projects/" +
            project1._id +
            "/comments" +
            (id ? "/" + id : "")
        )
        .set("x-auth-token", user.generateAuthToken());
    };
    it("should return 200 and all comments", async () => {
      const res = await exec();
      console.log(res.text);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(
        res.body.some((p) => p.name === projectComment1.name)
      ).toBeTruthy();
    });
    it("should paginate comments", async () => {
      const res = await exec().query({ page: 2, pageSize: 1 });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });

    it("should return 400 if invalid id is passed", async () => {
      const res = await exec("1");
      expect(res.status).toBe(400);
    });
    it("should return 404 if no comment with the given id exists", async () => {
      const res = await exec(validId);
      console.log(res.text);
      expect(res.status).toBe(404);
    });
    it("should return 400 if comment does not belong to project", async () => {
      const res = await exec(projectComment2._id);
      expect(res.status).toBe(400);
    });
    it("should return the comment if valid id is passed", async () => {
      const res = await exec(projectComment1._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("text", projectComment1.text);
    });
  });
  describe("POST /api/projectComments", () => {
    const exec = async (comment) => {
      return await request(server)
        .post(
          "/api/teams/" + team._id + "/projects/" + project1._id + "/comments"
        )
        .set("x-auth-token", user.generateAuthToken())
        .send(comment);
    };
    it("should return 400 if comment is less than 1 character", async () => {
      const res = await exec({ text: "" });
      expect(res.status).toBe(400);
    });
    it("should return 400 if comment is more than 1024 characters", async () => {
      const res = await exec({
        text: new Array(1026).join("a"),
      });
      expect(res.status).toBe(400);
    });
    it("should save the comment if it is valid", async () => {
      const res = await exec({ text: "zxcvb" });
      const comment = await Comment.findOne({ text: "zxcvb" });
      expect(res.status).toBe(200);
      expect(comment.project).toStrictEqual(project1._id);
      expect(comment).not.toBeNull();
    });
    it("should return the comment if it is valid", async () => {
      const res = await exec({ text: "projectComment4" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("text", "projectComment4");
    });
  });
  describe("PUT /api/projectComments", () => {
    const exec = async (id, comment) => {
      return await request(server)
        .put(
          "/api/teams/" +
            team._id +
            "/projects/" +
            project1._id +
            "/comments" +
            (id ? "/" + id : "")
        )
        .set("x-auth-token", user.generateAuthToken())
        .send(comment);
    };
    it("should return 400 if comment is less than 1 character", async () => {
      const res = await exec(projectComment1._id, { text: "" });
      expect(res.status).toBe(400);
    });
    it("should return 400 if comment is more than 1024 characters", async () => {
      const res = await exec(projectComment1._id, {
        text: new Array(1026).join("a"),
      });
      expect(res.status).toBe(400);
    });
    it("should return 400 if invalid id is passed", async () => {
      const res = await exec("1", { text: "zxcvb" });
      expect(res.status).toBe(400);
    });
    it("should return 404 if no comment with the given id exists", async () => {
      const res = await exec(validId, { text: "zxcvb" });
      expect(res.status).toBe(404);
    });
    it("should return 400 if comment does not belong to project", async () => {
      const res = await exec(projectComment2._id, { text: "zxcvb" });
      expect(res.status).toBe(400);
    });
    it("should update the comment if input is valid", async () => {
      const res = await exec(projectComment1._id, { text: "zxcvb" });
      const comment = await Comment.findById(projectComment1._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("text", "zxcvb");
      expect(comment.text).toBe("zxcvb");
    });
  });
});
