const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const auth = require("../../middleware/auth");
describe("auth middleware", () => {
  async function callAuth(token) {
    const req = {
      header: jest.fn().mockReturnValue(token),
      test: true,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();
    await auth(req, res, next);
    return { req, res, next };
  }
  it("should return 401 if no token is provided", async () => {
    const { res, next } = await callAuth(null);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
  it("should return 400 if token is invalid", async () => {
    const { res, next } = await callAuth("a");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
  it("should call next if token is valid", async () => {
    const token = jwt.sign(
      { _id: new mongoose.Types.ObjectId().toHexString() },
      config.get("jwtPrivateKey")
    );
    const { res, next } = await callAuth(token);
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
