const request = require("supertest");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
let server;
describe("Users", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await User.deleteMany({});
    await server.close();
  });

  describe("GET /users", () => {
    it("should return all users", async () => {
      await new User({
        username: "abc",
        email: "abc@abc.com",
        password: "12345",
      }).save();
      await new User({
        username: "abcd",
        email: "abcd@abc.com",
        password: "12345",
      }).save();
      const res = await request(server).get("/api/users");
      console.log(res.body);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((u) => u.username === "abc")).toBeTruthy();
      expect(res.body.some((u) => u.username === "abcd")).toBeTruthy();
      expect(res.body[0].password).toBeFalsy();
    });
    it("should paginate users", async () => {
      await new User({
        username: "abc",
        email: "abc@abc.com",
        password: "12345",
      }).save();
      await new User({
        username: "abcd",
        email: "abcd@abc.com",
        password: "12345",
      }).save();
      const res = await request(server).get("/api/users?page=1&limit=1");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body.some((u) => u.username === "abc")).toBeTruthy();
      expect(res.body.some((u) => u.username === "abcd")).toBeFalsy();
    });
    it("should return empty array if no users are found", async () => {
      const res = await request(server).get("/api/users");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });
  describe("GET /users/:id", () => {
    it("should return a user if valid id is passed", async () => {
      const user = new User({
        username: "abc",
        email: "abc@abc.com",
        password: "12345",
      });
      await user.save();
      const res = await request(server).get("/api/users/" + user._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("username", user.username);
      expect(res.body.password).toBeFalsy();
    });
    it("should return 400 if invalid id is passed", async () => {
      const res = await request(server).get("/api/users/1");
      expect(res.status).toBe(400);
    });
    it("should return 404 if no user with the given id exists", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const res = await request(server).get("/api/users/" + id);
      expect(res.status).toBe(404);
    });
    it("should return 404 if user is deleted", async () => {
      const user = new User({
        username: "abc",
        email: "abc@abc.com",
        password: "12345",
      });
      user.deleteUser();
      await user.save();
      const res = await request(server).get("/api/users/" + user._id);
      expect(res.status).toBe(404);
      expect(res.text).toContain("deleted");
    });
  });
  describe("POST /users", () => {
    function exec(user) {
      return request(server)
        .post("/api/users")
        .send({
          username: user?.username || "abc",
          email: user?.email || "abc@abc.com",
          password: user?.password || "12345",
          dob: user?.dob || "01/01/2000",
          name: user?.name || "abc",
        });
    }
    it("should return 400 if username is less than 3 characters", async () => {
      const res = await exec({
        username: "ab",
      });
      expect(res.status).toBe(400);
    });
    it("should return 400 if username is more than 50 characters", async () => {
      const res = await exec({
        username: new Array(52).join("a"),
      });
      expect(res.status).toBe(400);
    });
    it("should return 400 if email is less than 5 characters", async () => {
      const res = await exec({
        email: "abc",
      });
      expect(res.status).toBe(400);
    });
    it("should return 400 if email is more than 255 characters", async () => {
      const res = await exec({
        email: new Array(257).join("a"),
      });
      expect(res.status).toBe(400);
    });
    it("should return 400 if password is less than 5 characters", async () => {
      const res = await exec({
        password: "1234",
      });
      expect(res.status).toBe(400);
    });
    it("should return 400 if dob is not a valid date", async () => {
      const res = await exec({
        dob: "abc",
      });
      expect(res.status).toBe(400);
    });
    it("should return 400 if name is less than 3 characters", async () => {
      const res = await exec({
        name: "ab",
      });
      expect(res.status).toBe(400);
    });
    it("should return 400 if name is more than 50 characters", async () => {
      const res = await exec({
        name: new Array(52).join("a"),
      });
      expect(res.status).toBe(400);
    });
    it("should return the user with jwt as header if it is valid", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("username", "abc");
      expect(res.header).toHaveProperty("x-auth-token");
    });
    it("should save the user if it is valid", async () => {
      await exec();
      const user = await User.findOne({ username: "abc" });
      expect(user).not.toBeNull();
      expect(user).toHaveProperty("username", "abc");
    });
  });
  describe("PUT /users/:id", () => {
    function exec(id) {
      return request(server)
        .put("/api/users/" + id)
        .send({
          username: "abc",
          email: "abc@abc.com",
          password: "12345",
        });
    }
    it("it should return 400 if invalid id is passed", async () => {
      const res = await exec(1);
      expect(res.status).toBe(400);
    });
    it("should return 404 if no user with the given id exists", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const res = await exec(id);
      expect(res.status).toBe(404);
    });
    it("Should return 200 if user is updated and returned", async () => {
      let user = {
        username: "xyz",
        email: "abc@abc.com",
        password: "12345",
      };
      user = await new User(user).save();
      const res = await exec(user._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("username", "abc");
    });
  });
  describe("DELETE /users/:id", () => {
    let user;
    beforeEach(async () => {
      user = await new User({
        username: "abc",
        email: "abc@abc.com",
        password: "12345",
      }).save();
    });

    const exec = (id) => {
      return request(server)
        .delete("/api/users/" + id)
        .set("x-auth-token", user.generateAuthToken());
    };
    it("it should return 400 if invalid id is passed", async () => {
      const res = await exec("1");
      expect(res.status).toBe(400);
    });
    it("should return 404 if no user with the given id exists", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      const res = await exec(id);
      expect(res.status).toBe(404);
    });
    it("Should return 200 if user is deleted", async () => {
      const res = await exec(user._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("username", "abc");
      user = await User.findById(user._id);
      expect(user.isDeleted).toBe(true);
      expect(user.deletedAt).not.toBeNull();
    });
  });
});
