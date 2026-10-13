const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./app/routes/auth.routes");
const roleRoutes = require("./app/routes/roles.routes");
const userRoutes = require("./app/routes/users.routes");
const errorMiddleware = require("./app/middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "success", message: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);

// Unknown route
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

// Central error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
