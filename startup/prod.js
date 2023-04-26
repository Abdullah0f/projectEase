const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
module.exports = function (app) {
  app.use(cors());
  app.use(helmet());
  app.use(compression());
};
