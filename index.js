const mongoose = require("mongoose");

const app = require("express")();
require("./startup/routes")(app);
require("joi").objectId = require("joi-objectid")(require("joi"));

mongoose
  .connect("mongodb://localhost/projectEase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB..."));
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
