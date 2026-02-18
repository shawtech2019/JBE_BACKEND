const express = require("express");
const cors = require("cors");
const helmet = require("helmet");


const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json());
app.use("/api/auth", require("./app/routes/auth.routes"));

module.exports = app;