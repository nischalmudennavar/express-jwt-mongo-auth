const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
require("./helpers/init.mongodb");
require("dotenv").config({ path: "./.env" });
const authRoute = require("./routes/auth.route");
const { verifyAccessToken } = require("./helpers/jwt_helper");

const redis_client = require('./helpers/init.redis');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

const PORT = process.env.PORT;

app.use("/api/auth", authRoute);

app.get("/api", verifyAccessToken, async (req, res, next) => {
  res.send("Hello World");
});

app.use(async (req, res, next) => {
  next(createError.NotFound("This route does not exist"));
});

// universal error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.send({
    error: {
      status: error.status || 500,
      message: error.message, // this message is from above
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
