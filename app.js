const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const authRoutes = require("./app/routes/auth.routes");
const roleRoutes = require("./app/routes/roles.routes");
const userRoutes = require("./app/routes/users.routes");
const profileRoutes = require("./app/routes/profile.routes");
const propertyRoutes = require("./app/routes/property.routes");
const lookupRoutes = require("./app/routes/lookup.routes");
const errorMiddleware = require("./app/middlewares/error.middleware");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json());

// Uploaded files (avatars) are served statically.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "success", message: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/investor/properties", propertyRoutes);
app.use("/api/lookup", lookupRoutes);

// Unknown route
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

// Central error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
