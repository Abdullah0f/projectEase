const mongoose = require("mongoose");
module.exports = function asyncMiddleware(handler) {
  return async (req, res, next) => {
    try {
      if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send("invalid ID.");
      await handler(req, res);
    } catch (ex) {
      next(ex);
    }
  };
};
