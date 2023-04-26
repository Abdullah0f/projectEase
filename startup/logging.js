const winston = require("winston");
const config = require("config");
// require("winston-mongodb");

module.exports = function () {
  winston.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      colorize: true,
      prettyPrint: true,
    })
  );
  winston.exceptions.handle(
    new winston.transports.File({ filename: "uncaughtExceptions.log" }),
    new winston.transports.Console({ colorize: true, prettyPrint: true })
  );

  winston.add(new winston.transports.File({ filename: "logfile.log" }));
  if (!config.get("jwtPrivateKey")) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }
  //   winston.add(
  //     new winston.transports.MongoDB({
  //       db: "mongodb://localhost/vidly",
  //       options: { useUnifiedTopology: true },
  //     })
  //   );
};
