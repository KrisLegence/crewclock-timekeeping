const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/validation/flags — returns all unresolved flags with entry details
router.get('/flags', async (req, res) => {
  const { rows } = await db.query(`
    SELECT vf.*, te.work_date, te.hours_regular, te.hours_overtime, te.hours_double,
           te.status AS entry_status, te.source,
           emp.first_name, emp.last_name, emp.employee_number,
           cc.code AS cost_code_value, cc.job_number
    FROM validation_flags vf
    JOIN time_entries te ON te.id = vf.time_entry_id
    JOIN employees emp   ON emp.id = te.employee_id
    JOIN cost_codes cc   ON cc.id = te.cost_code_id
    WHERE vf.is_resolved = FALSE
    ORDER BY vf.created_at DESC
  `);
  res.json(rows);
});

// POST /api/validation/run — run the validation engine, create new flags
router.post('/run', async (req, res) => {
  const { start_date, end_date } = req.body;
  const dateFilter = start_date && end_date
    ? `AND te.work_date BETWEEN '${start_date}' AND '${end_date}'`
    : `AND te.work_date >= CURRENT_DATE - INTERVAL '7 days'`;

  const flags = [];

  // Rule 1: 16+ hour days
  const longDays = await db.query(`
    SELECT te.id, emp.first_name, emp.last_name,
           (te.hours_regular + te.hours_overtime + te.hours_double) AS total_hours
    FROM time_entries te
    JOIN employees emp ON emp.id = te.employee_id
    WHERE te.status != 'rejected'
      ${dateFilter}
      AND (te.hours_regular + te.hours_overtime + te.hours_double) >= 16
  `);
  for (const row of longDays.rows) {
    flags.push({
      time_entry_id: row.id,
      flag_type: 'excessive_hours',
      flag_message: `${row.first_name} ${row.last_name} logged ${row.total_hours}h — exceeds 16h threshold`,
    });
  }

  // Rule 2: Missing cost codes (null cost_code_id — shouldn't happen with FK, but safety check)
  const missingCodes = await db.query(`
    SELECT te.id, emp.first_name, emp.last_name
    FROM time_entries te
    JOIN employees emp ON emp.id = te.employee_id
    LEFT JOIN cost_codes cc ON cc.id = te.cost_code_id
    WHERE te.status != 'rejected'
      ${dateFilter}
      AND (cc.id IS NULL OR cc.is_active = FALSE)
  `);
  for (const row of missingCodes.rows) {
    flags.push({
      time_entry_id: row.id,
      flag_type: 'missing_cost_code',
      flag_message: `${row.first_name} ${row.last_name} has entry with missing or inactive cost code`,
    });
  }

  // Rule 3: Duplicate entries (same employee, same date, same cost code)
  const dupes = await db.query(`
    SELECT te.employee_id, te.work_date, te.cost_code_id,
           array_agg(te.id) AS entry_ids,
           emp.first_name, emp.last_name, COUNT(*) AS cnt
    FROM time_entries te
    JOIN employees emp ON emp.id = te.employee_id
    WHERE te.status != 'rejected'
      ${dateFilter}
    GROUP BY te.employee_id, te.work_date, te.cost_code_id, emp.first_name, emp.last_name
    HAVING COUNT(*) > 1
  `);
  for (const row of dupes.rows) {
    for (const entryId of row.entry_ids) {
      flags.push({
        time_entry_id: entryId,
        flag_type: 'duplicate_entry',
        flag_message: `${row.first_name} ${row.last_name} has ${row.cnt} entries for same date+cost code`,
      });
    }
  }

  // Rule 4: Entries with no clock-in/out and source is not huddle
  const noPunch = await db.query(`
    SELECT te.id, emp.first_name, emp.last_name
    FROM time_entries te
    JOIN employees emp ON emp.id = te.employee_id
    WHERE te.status != 'rejected'
      ${dateFilter}
      AND te.clock_in IS NULL
      AND te.source NOT IN ('huddle', 'manual')
  `);
  for (const row of noPunch.rows) {
    flags.push({
      time_entry_id: row.id,
      flag_type: 'missing_punch',
      flag_message: `${row.first_name} ${row.last_name} has no clock-in time recorded`,
    });
  }

  // Insert flags (skip if already flagged for same entry+type)
  let inserted = 0;
  for (const f of flags) {
    const { rowCount } = await db.query(
      `INSERT INTO validation_flags (time_entry_id, flag_type, flag_message)
       SELECT $1, $2, $3
       WHERE NOT EXISTS (
         SELECT 1 FROM validation_flags
         WHERE time_entry_id = $1 AND flag_type = $2 AND is_resolved = FALSE
       )`,
      [f.time_entry_id, f.flag_type, f.flag_message]
    );
    inserted += rowCount;
  }

  res.json({ scanned: flags.length, new_flags: inserted });
});

// PUT /api/validation/flags/:id/resolve
router.put('/flags/:id/resolve', async (req, res) => {
  const { resolved_by } = req.body;
  const { rows } = await db.query(
    `UPDATE validation_flags SET is_resolved = TRUE, resolved_by = $1, resolved_at = NOW()
     WHERE id = $2 RETURNING *`,
    [resolved_by, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Flag not found' });
  res.json(rows[0]);
});

module.exports = router;
