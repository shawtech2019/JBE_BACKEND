const User = require("../models/User");

// Get all users
exports.getAllUsers = async () => {
  return await User.find().select("-password");
};

// Get user by ID
exports.getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

// Get user by email
exports.getUserByEmail = async (email) => {
  return await User.findOne({ email }).select("-password");
};