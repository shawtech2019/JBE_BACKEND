const User = require("../models/User");
const Role = require("../models/Role");

// Get all users
exports.getAllUsers = async () => {
  const users = await User.find();
  return users.map(User.toPublic);
};

// Get user by ID
exports.getUserById = async (id) => {
  const user = await User.findById(id);
  return User.toPublic(user);
};

// Get user by email
exports.getUserByEmail = async (email) => {
  const user = await User.findByEmail(email);
  return User.toPublic(user);
};

// Roles attached to a user
exports.getUserRoles = async (id) => {
  return Role.forUser(id);
};
