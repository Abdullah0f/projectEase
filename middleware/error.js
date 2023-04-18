function error(err, req, res, next) {
  // Log the exception

  console.log(err.message, err);
  res.status(500).send("Something failed.");
}
module.exports = error;
