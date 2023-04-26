const mongoose = require("mongoose");
const config = require("config");
const app = require("express")();
require("joi").objectId = require("joi-objectid")(require("joi"));

require("./startup/routes")(app);
require("./startup/prod")(app);

const db = config.get("db");
mongoose.connect(db).then(() => console.log("Connected to MongoDB..."));
const server = app.listen(config.get("port"), () => {
  console.log("Server listening on port " + config.get("port"));
});
module.exports = server;
