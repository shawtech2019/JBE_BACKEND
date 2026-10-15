const User = require("../models/User");
const { HttpError } = require("../utils/http-error");

/** Trim optional text fields and turn blank strings into null. */
const normalizeOptional = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

exports.getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, "User not found");
  return { user: User.toPublic(user) };
};

exports.updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, "User not found");

  await User.updateProfile(userId, {
    firstName: data.firstName,
    lastName: normalizeOptional(data.lastName),
    phone: normalizeOptional(data.phone),
    jobTitle: normalizeOptional(data.jobTitle),
    company: normalizeOptional(data.company),
    location: normalizeOptional(data.location),
  });

  const updated = await User.findById(userId);
  return { user: User.toPublic(updated) };
};

exports.updateAvatar = async (userId, avatarUrl) => {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, "User not found");

  await User.updateAvatar(userId, avatarUrl);

  const updated = await User.findById(userId);
  return { user: User.toPublic(updated) };
};

exports.getNotificationPreferences = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, "User not found");
  return { preferences: User.toPublic(user).notificationPreferences };
};

exports.updateNotificationPreferences = async (userId, prefs) => {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, "User not found");

  const merged = await User.updateNotificationPreferences(userId, prefs);
  return { preferences: merged };
};

exports.updateSecurity = async (userId, { twoFactorEnabled }) => {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, "User not found");

  await User.setTwoFactorEnabled(userId, twoFactorEnabled);

  const updated = await User.findById(userId);
  return { user: User.toPublic(updated) };
};
