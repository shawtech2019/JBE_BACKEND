const Property = require("../models/Property");
const { HttpError } = require("../utils/http-error");

/** Safely turn a JSON string (or array) into an array. */
const parseList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

exports.createProperty = async (userId, body, files) => {
  const images = (files?.images || []).map(
    (file) => `/uploads/properties/images/${file.filename}`
  );

  const fileVideos = (files?.videos || []).map(
    (file) => `/uploads/properties/videos/${file.filename}`
  );

  const videos = [...fileVideos, ...parseList(body.videoLinks)];

  const id = await Property.create({
    ...body,
    ownerId: userId,
    amenities: parseList(body.amenities),
    titleDocuments: parseList(body.titleDocuments),
    images,
    videos,
  });

  const row = await Property.findById(id);
  return { property: Property.toPublic(row) };
};

exports.listProperties = async (userId) => {
  const rows = await Property.findByOwner(userId);
  return { properties: rows.map(Property.toPublic) };
};

exports.getProperty = async (userId, id) => {
  const row = await Property.findById(id);

  if (!row || Number(row.owner_id) !== Number(userId)) {
    throw new HttpError(404, "Property not found");
  }

  return { property: Property.toPublic(row) };
};
