const jwt = require("jsonwebtoken");

exports.signToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, {expireId: "1d"});