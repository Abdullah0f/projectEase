const { User } = require("../../models/user");
const request = require("supertest");
let server;
describe("api/auth", () => {
  beforeAll(() => {
    server = require("../../index");
  });
  afterAll(async () => {
    await User.deleteMany({});
    await server.close();
  });
  describe("auth/ POST", () => {
    beforeAll(async () => {
      new User({
        username: "cba",
        email: "cba@cba.com",
        password: "12345",
      }).save();
    });
    function exec(user) {
      return request(server).post("/api/auth").send(user);
    }

    it("should return 400 if password not provided", async () => {
      const res = await exec({
        username: "abc",
        email: "abc@abc.com",
      });
      expect(res.status).toBe(400);
    });
    it("should return 400 if nor username or email are provided", async () => {
      const res = await exec({ password: "12345" });
      expect(res.status).toBe(400);
    });
    it("should return 400 if username is not found", async () => {
      const res = await exec({
        username: "abc",
        password: "12345",
      });
      expect(res.status).toBe(400);
    });
    it("should return 400 if email is not found", async () => {
      const res = await exec({
        email: "abc1@abc1.com",
        password: "12345",
      });
      expect(res.status).toBe(400);
    });
    it("should return 400 if password is incorrect", async () => {
      const res = await exec({
        username: "cba",
        password: "123456",
      });
      expect(res.status).toBe(400);
    });
    it("should return 200 if username and password are correct", async () => {
      const res = await exec({
        username: "cba",
        password: "12345",
      });
      expect(res.status).toBe(200);
    });
    it("should return 200 if email and password are correct", async () => {
      const res = await exec({
        email: "cba@cba.com",
        password: "12345",
      });
      expect(res.status).toBe(200);
    });
  });
});
