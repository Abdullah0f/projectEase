const mongoose = require("mongoose");
const config = require("config");
const app = require("express")();
require("./startup/routes")(app);
require("joi").objectId = require("joi-objectid")(require("joi"));

const db = config.get("db");
mongoose.connect(db).then(() => console.log("Connected to MongoDB..."));
console.log(db);
const server = app.listen(config.get("port"), () => {
  console.log("Server listening on port " + config.get("port"));
});
module.exports = server;
