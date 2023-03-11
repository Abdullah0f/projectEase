const app = require("express")();
require("./startup/routes")(app);
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
