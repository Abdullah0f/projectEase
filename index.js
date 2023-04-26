const app = require("express")();
const mongoose = require("mongoose");
const config = require("config");
const winston = require("winston");
require("joi").objectId = require("joi-objectid")(require("joi"));
require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/prod")(app);

let db = config.get("db");
if (db.startsWith('"')) db = db.substring(1, db.length - 1);
mongoose.connect(db).then(() => console.log("Connected to MongoDB..."));
const server = app.listen(config.get("port"), () => {
  winston.info("Server listening on port " + config.get("port"));
});
module.exports = server;
