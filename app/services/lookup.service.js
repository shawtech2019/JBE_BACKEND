const db = require("../config/db");

/** Only these tables may be queried (table names can't be parameterised). */
const ALLOWED_TABLES = [
  "lookup_property_types",
  "lookup_price_periods",
  "lookup_purposes",
  "lookup_amenities",
  "lookup_title_documents",
];

/** Read every row from an allowed lookup table, ordered by name. */
const readAll = async (table) => {
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error(`Unknown lookup table: ${table}`);
  }

  const [rows] = await db.execute(
    `SELECT id, name FROM ${table} ORDER BY name ASC`
  );
  return rows.map((row) => ({ id: row.id, name: row.name }));
};

/**
 * Reference lists that drive the create-property form:
 * property types, price periods, amenities and title documents.
 * The seeder fills these tables on `npm start`.
 */
exports.getLookupLists = async () => {
  const [propertyTypes, pricePeriods, purposes, amenities, titleDocuments] =
    await Promise.all([
      readAll("lookup_property_types"),
      readAll("lookup_price_periods"),
      readAll("lookup_purposes"),
      readAll("lookup_amenities"),
      readAll("lookup_title_documents"),
    ]);

  return {
    propertyTypes,
    pricePeriods,
    purposes,
    amenities,
    titleDocuments,
  };
};
