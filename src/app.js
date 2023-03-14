require("dotenv").config();
const express = require("express");
const connectDatabase = require("./conn/connection");
const port = parseInt(process.env.PORT || 8000);
const createError = require("http-errors");
const morgan = require("morgan");
const indexRouter = require("./route");
const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(indexRouter);

app.use((req, res, next) => next(createError.NotFound()));

app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  return res.status(status).json(status, message);
});

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server Running and up at ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
