const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const userRoutes  = require("./app/routes/users.routes")


const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json());
app.use("/api/auth", require("./app/routes/auth.routes"));
app.use("/api/users", userRoutes);

module.exports = app;