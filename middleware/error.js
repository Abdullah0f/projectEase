const winston = require("winston");
function error(err, req, res, next) {
  // Log the exception
  winston.log("error", err.message, err);
  res.status(500).send("Something failed.");
}
module.exports = error;
