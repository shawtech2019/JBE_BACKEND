const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUser);

module.exports = router;