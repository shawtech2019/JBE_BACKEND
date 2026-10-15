const db = require("../config/db");

/** Coerce optional input into a finite number, or null when blank. */
const toNum = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Coerce input into a 0/1 flag. */
const toBool = (value) =>
  value === true || value === "true" || value === 1 || value === "1" ? 1 : 0;

/** Trim optional text; blank strings become null. */
const toText = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

/** Keep only the date part of a date string. */
const toDate = (value) => (value ? String(value).slice(0, 10) : null);

/** Serialise a list column; anything that isn't an array becomes []. */
const toJson = (value) => JSON.stringify(Array.isArray(value) ? value : []);

/** MySQL returns JSON columns either parsed or as a string; normalise both. */
const parseJsonArray = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

/** DATE columns come back as a Date; expose a plain YYYY-MM-DD string. */
const formatDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

/**
 * Investor-owned property listings. Multi-value fields (amenities, title
 * documents, images, videos) live in JSON columns.
 */
class Property {
  static async create(data) {
    const columns = {
      owner_id: data.ownerId,
      title: toText(data.title),
      property_type: toText(data.propertyType),
      purpose: toText(data.purpose),
      description: toText(data.description),
      price: toNum(data.price),
      price_period: toText(data.pricePeriod),
      negotiable: toBool(data.negotiable),
      service_charge: toNum(data.serviceCharge),
      caution_deposit: toNum(data.cautionDeposit),
      agency_fee: toNum(data.agencyFee),
      legal_fee: toNum(data.legalFee),
      bedrooms: toNum(data.bedrooms),
      bathrooms: toNum(data.bathrooms),
      toilets: toNum(data.toilets),
      parking: toNum(data.parking),
      furnishing: toText(data.furnishing),
      condition_type: toText(data.condition),
      total_units: toNum(data.totalUnits),
      floor_area: toNum(data.floorArea),
      land_size: toNum(data.landSize),
      floors: toNum(data.floors),
      year_built: toNum(data.yearBuilt),
      country: toText(data.country) || "Nigeria",
      state: toText(data.state),
      city: toText(data.city),
      lga: toText(data.lga),
      estate: toText(data.estate),
      landmark: toText(data.landmark),
      address: toText(data.address),
      agent_name: toText(data.agentName),
      agent_phone: toText(data.agentPhone),
      agent_whatsapp: toText(data.agentWhatsapp),
      available_from: toDate(data.availableFrom),
      status: toText(data.status) || "Active",
      featured: toBool(data.featured),
      amenities: toJson(data.amenities),
      title_documents: toJson(data.titleDocuments),
      images: toJson(data.images),
      videos: toJson(data.videos),
    };

    const keys = Object.keys(columns);

    const [result] = await db.execute(
      `INSERT INTO properties (${keys.join(", ")})
       VALUES (${keys.map(() => "?").join(", ")})`,
      keys.map((key) => columns[key])
    );

    return result.insertId;
  }

  static async findByOwner(ownerId) {
    const [rows] = await db.execute(
      `SELECT * FROM properties
       WHERE owner_id = ?
       ORDER BY created_at DESC, id DESC`,
      [ownerId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM properties WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0];
  }

  /** Map a DB row into the camelCase shape sent to the client. */
  static toPublic(row) {
    if (!row) return null;
    return {
      id: row.id,
      ownerId: row.owner_id,
      title: row.title,
      propertyType: row.property_type,
      purpose: row.purpose,
      description: row.description ?? null,
      price: row.price !== null ? Number(row.price) : null,
      pricePeriod: row.price_period ?? null,
      negotiable: Boolean(row.negotiable),
      serviceCharge:
        row.service_charge !== null ? Number(row.service_charge) : null,
      cautionDeposit:
        row.caution_deposit !== null ? Number(row.caution_deposit) : null,
      agencyFee: row.agency_fee !== null ? Number(row.agency_fee) : null,
      legalFee: row.legal_fee !== null ? Number(row.legal_fee) : null,
      bedrooms: row.bedrooms ?? null,
      bathrooms: row.bathrooms ?? null,
      toilets: row.toilets ?? null,
      parking: row.parking ?? null,
      furnishing: row.furnishing ?? null,
      condition: row.condition_type ?? null,
      totalUnits: row.total_units ?? null,
      floorArea: row.floor_area !== null ? Number(row.floor_area) : null,
      landSize: row.land_size !== null ? Number(row.land_size) : null,
      floors: row.floors ?? null,
      yearBuilt: row.year_built ?? null,
      country: row.country ?? null,
      state: row.state ?? null,
      city: row.city ?? null,
      lga: row.lga ?? null,
      estate: row.estate ?? null,
      landmark: row.landmark ?? null,
      address: row.address ?? null,
      agentName: row.agent_name ?? null,
      agentPhone: row.agent_phone ?? null,
      agentWhatsapp: row.agent_whatsapp ?? null,
      availableFrom: formatDate(row.available_from),
      status: row.status,
      featured: Boolean(row.featured),
      amenities: parseJsonArray(row.amenities),
      titleDocuments: parseJsonArray(row.title_documents),
      images: parseJsonArray(row.images),
      videos: parseJsonArray(row.videos),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

module.exports = Property;
