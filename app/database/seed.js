const bcrypt = require('bcrypt');
const db = require('../config/db');

async function seed() {
  console.log('Starting database seed...');
  try {
    const passwordHash = await bcrypt.hash('Password123!', 12);
    await db.execute(
      `INSERT INTO tenants (email, first_name, last_name, password_hash, role)
       VALUES (?, ?, ?, ?, 'TENANT')
       ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name)`,
      ['tenant@example.com','John','Doe', passwordHash]
    );

    const [[t]]=await db.execute('SELECT id FROM tenants WHERE email=? LIMIT 1', ['tenant@example.com']);
    const tenantId = t.id;
    await db.execute(
      `INSERT INTO leases (tenant_id, apartment, unit, monthly_rent, lease_start_date, lease_end_date, status, auto_pay_enabled)
       SELECT ?, 'Apartment 5C', 'Unit 12', 100000, '2026-01-01', '2027-12-31', 'ACTIVE', 1
       WHERE NOT EXISTS (SELECT 1 FROM leases WHERE tenant_id=?)`, [tenantId, tenantId]
    );

    await seedLookups();
    console.log('Database seed completed successfully.');
  } catch (e) { console.error('Seed failed:', e); process.exitCode=1; } finally { await db.end(); }
}

async function seedLookups() {
  const seed = async (table, cols, rows) => {
    for (const r of rows) {
      await db.execute(
        `INSERT IGNORE INTO ${table} (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`, r
      );
    }
  };
  const props=[['Detached Duplex'],['Semi-Detached Duplex'],['Terraced Duplex'],['Block of Flats / Apartment'],['Mini Flat'],['Self-Contained (Self-Con)'],['Studio Apartment'],['Bungalow'],['Penthouse'],['Maisonette'],["Boys' Quarters (BQ)"],['Land / Plot'],['Commercial - Shop'],['Commercial - Office'],['Commercial - Warehouse'],['Short-let Apartment'],['Hostel'],['Hotel / Guest House']];
  await seed('lookup_property_types', ['name'], props);
  const periods=[['Per Annum'],['Per Month'],['Per Week'],['Per Night'],['Total (Outright)']];
  await seed('lookup_price_periods', ['name'], periods);
  const amen=[['24/7 Power Supply'],['Standby Generator'],['Solar / Inverter'],['Prepaid Meter'],['Borehole / Water Supply'],['Water Heater'],['Air Conditioning'],['Fitted Kitchen'],['POP Ceiling'],['Tiled Floors'],['Built-in Wardrobes'],['Balcony / Terrace'],['Swimming Pool'],['Gym'],['Elevator / Lift'],['Gated Estate'],['24/7 Security / CCTV'],['Interlocked Compound'],['Parking Space'],['Serviced'],['Pet Friendly'],['Garden / Green Area'],["Boys' Quarters (BQ)"],['Wheelchair Accessible'],['Close to School'],['Close to Market'],['Good Road Network']];
  await seed('lookup_amenities', ['name'], amen);
  const docs=[['Certificate of Occupancy (C of O)'],["Governor's Consent"],['Deed of Assignment'],['Survey Plan'],['Excision & Gazette'],['Registered Deed'],['Right of Occupancy (R of O)'],['Freehold'],['Leasehold']];
  await seed('lookup_title_documents', ['name'], docs);
  const purposes=[['For Rent'],['For Sale'],['Short Let'],['Lease']];
  await seed('lookup_purposes', ['name'], purposes);
}

seed();
