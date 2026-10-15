const asyncHandler = require("../utils/async-handler");
const { HttpError } = require("../utils/http-error");
const profileService = require("../services/profile.service");

exports.getProfile = asyncHandler(async (req, res) => {
  const data = await profileService.getProfile(req.user.id);
  res.json({ status: "success", ...data });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const data = await profileService.updateProfile(req.user.id, req.body);
  res.json({ status: "success", message: "Profile updated", ...data });
});

exports.updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "Please choose an image to upload");

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const data = await profileService.updateAvatar(req.user.id, avatarUrl);
  res.json({ status: "success", message: "Profile photo updated", ...data });
});

exports.getNotifications = asyncHandler(async (req, res) => {
  const data = await profileService.getNotificationPreferences(req.user.id);
  res.json({ status: "success", ...data });
});

exports.updateNotifications = asyncHandler(async (req, res) => {
  const data = await profileService.updateNotificationPreferences(
    req.user.id,
    req.body
  );
  res.json({
    status: "success",
    message: "Notification preferences updated",
    ...data,
  });
});

exports.updateSecurity = asyncHandler(async (req, res) => {
  const data = await profileService.updateSecurity(req.user.id, req.body);
  res.json({
    status: "success",
    message: "Security settings updated",
    ...data,
  });
});
