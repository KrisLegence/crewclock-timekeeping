const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { calculateDailyHours, calculatePerDiem } = require('../logic/payrollRules');
const validateManualEntry = require('../middleware/validateManualEntry');

// GET /api/time-entries?date=2026-04-28&status=pending
router.get('/', async (req, res) => {
  const { date, employee_id, status, start_date, end_date } = req.query;
  let sql = `
    SELECT te.*, emp.first_name, emp.last_name, emp.employee_number,
           cc.code AS cost_code_value, cc.description AS cost_code_desc, cc.job_number
    FROM time_entries te
    JOIN employees emp ON emp.id = te.employee_id
    JOIN cost_codes cc ON cc.id = te.cost_code_id
    WHERE 1=1
  `;
  const params = [];

  if (date) {
    params.push(date);
    sql += ` AND te.work_date = $${params.length}`;
  }
  if (start_date && end_date) {
    params.push(start_date, end_date);
    sql += ` AND te.work_date BETWEEN $${params.length - 1} AND $${params.length}`;
  }
  if (employee_id) {
    params.push(employee_id);
    sql += ` AND te.employee_id = $${params.length}`;
  }
  if (status) {
    params.push(status);
    sql += ` AND te.status = $${params.length}`;
  }

  sql += ' ORDER BY te.work_date DESC, emp.last_name';

  const { rows } = await db.query(sql, params);
  res.json(rows);
});

// POST /api/time-entries (single entry)
router.post('/', validateManualEntry(), async (req, res) => {
  const {
    employee_id, cost_code_id, work_date, clock_in, clock_out,
    total_hours, per_diem_location, source, foreman_id,
    proof_photo_url, notes, reason_code, reason_note, created_by,
  } = req.body;

  const hours = calculateDailyHours(total_hours || 0);
  const perDiem = per_diem_location ? calculatePerDiem(per_diem_location) : { amount: 0 };

  const { rows } = await db.query(
    `INSERT INTO time_entries
      (employee_id, cost_code_id, work_date, clock_in, clock_out,
       hours_regular, hours_overtime, hours_double, per_diem,
       per_diem_location, source, foreman_id, proof_photo_url,
       notes, reason_code, reason_note, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING *`,
    [employee_id, cost_code_id, work_date, clock_in, clock_out,
     hours.regular, hours.overtime, hours.doubleTime, perDiem.amount,
     per_diem_location, source || 'manual', foreman_id, proof_photo_url,
     notes, reason_code, reason_note, created_by]
  );

  res.status(201).json(rows[0]);
});

// POST /api/time-entries/huddle (bulk entry for crew)
router.post('/huddle', async (req, res) => {
  const {
    employee_ids, cost_code_id, work_date, total_hours,
    per_diem_location, foreman_id, proof_photo_url, notes,
  } = req.body;

  if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
    return res.status(400).json({ error: 'employee_ids array is required' });
  }

  const hours = calculateDailyHours(total_hours || 8);
  const perDiem = per_diem_location ? calculatePerDiem(per_diem_location) : { amount: 0 };

  const results = [];
  for (const empId of employee_ids) {
    const { rows } = await db.query(
      `INSERT INTO time_entries
        (employee_id, cost_code_id, work_date, hours_regular,
         hours_overtime, hours_double, per_diem, per_diem_location,
         source, foreman_id, proof_photo_url, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'huddle',$9,$10,$11,$12)
       ON CONFLICT (employee_id, work_date, cost_code_id)
         WHERE status != 'rejected'
       DO NOTHING
       RETURNING *`,
      [empId, cost_code_id, work_date, hours.regular,
       hours.overtime, hours.doubleTime, perDiem.amount,
       per_diem_location, foreman_id, proof_photo_url, notes, foreman_id]
    );
    if (rows[0]) results.push(rows[0]);
  }

  res.status(201).json({ created: results.length, entries: results });
});

// PUT /api/time-entries/:id
router.put('/:id', validateManualEntry(), async (req, res) => {
  const { id } = req.params;
  const {
    cost_code_id, work_date, clock_in, clock_out,
    total_hours, per_diem_location, notes, status,
    reason_code, reason_note, changed_by, approved_by,
  } = req.body;

  const hours = total_hours != null ? calculateDailyHours(total_hours) : null;
  const perDiem = per_diem_location ? calculatePerDiem(per_diem_location) : null;

  const { rows } = await db.query(
    `UPDATE time_entries SET
      cost_code_id     = COALESCE($1, cost_code_id),
      work_date        = COALESCE($2, work_date),
      clock_in         = COALESCE($3, clock_in),
      clock_out        = COALESCE($4, clock_out),
      hours_regular    = COALESCE($5, hours_regular),
      hours_overtime   = COALESCE($6, hours_overtime),
      hours_double     = COALESCE($7, hours_double),
      per_diem         = COALESCE($8, per_diem),
      per_diem_location = COALESCE($9, per_diem_location),
      notes            = COALESCE($10, notes),
      status           = COALESCE($11, status),
      reason_code      = $12,
      reason_note      = $13,
      approved_by      = COALESCE($14, approved_by),
      approved_at      = CASE WHEN $11 = 'approved' THEN NOW() ELSE approved_at END,
      updated_at       = NOW()
     WHERE id = $15
     RETURNING *`,
    [
      cost_code_id, work_date, clock_in, clock_out,
      hours?.regular, hours?.overtime, hours?.doubleTime,
      perDiem?.amount, per_diem_location, notes, status,
      reason_code, reason_note, approved_by, id,
    ]
  );

  if (!rows[0]) return res.status(404).json({ error: 'Entry not found' });
  res.json(rows[0]);
});

// DELETE /api/time-entries/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(
    `UPDATE time_entries SET status = 'rejected', updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Entry not found' });
  res.json({ deleted: true, entry: rows[0] });
});

module.exports = router;
