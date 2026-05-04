require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, '001_schema.sql'), 'utf8');
  try {
    await db.query(sql);
    console.log('Migration complete — all tables created.');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Tables already exist — skipping migration.');
    } else {
      console.error('Migration failed:', err.message);
      process.exit(1);
    }
  }
  process.exit(0);
}

migrate();
