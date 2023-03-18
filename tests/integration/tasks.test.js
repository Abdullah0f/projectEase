const request = require("supertest");
const { User } = require("../../models/user");
const { Team } = require("../../models/team");
const { Task } = require("../../models/task");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
let server;
describe("Tasks", () => {
  describe("GET /tasks", () => {
    it("should return all tasks", async () => {});
  });
});
