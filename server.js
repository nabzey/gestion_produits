var express = require("express");
var swaggerUi = require("swagger-ui-express");
var swaggerSpec = require("./swagger.js");
var routes = require("./route.js");

var app = express();
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

routes.setupRoutes(app);

app.listen(3000, function() {
  console.log("API running on http://localhost:3000");
  console.log("Documentation Swagger disponible sur http://localhost:3000/api-docs");
});
