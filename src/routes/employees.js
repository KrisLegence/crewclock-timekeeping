const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  const { crew_id, role, active } = req.query;
  let sql = 'SELECT * FROM employees WHERE 1=1';
  const params = [];

  if (crew_id) {
    params.push(crew_id);
    sql += ` AND crew_id = $${params.length}`;
  }
  if (role) {
    params.push(role);
    sql += ` AND role = $${params.length}`;
  }
  if (active !== undefined) {
    params.push(active === 'true');
    sql += ` AND is_active = $${params.length}`;
  }

  sql += ' ORDER BY last_name, first_name';
  const { rows } = await db.query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Employee not found' });
  res.json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { first_name, last_name, role, crew_id, hourly_rate, home_state, is_active } = req.body;
  const { rows } = await db.query(
    `UPDATE employees SET
      first_name = COALESCE($1, first_name),
      last_name  = COALESCE($2, last_name),
      role       = COALESCE($3, role),
      crew_id    = COALESCE($4, crew_id),
      hourly_rate = COALESCE($5, hourly_rate),
      home_state = COALESCE($6, home_state),
      is_active  = COALESCE($7, is_active),
      updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [first_name, last_name, role, crew_id, hourly_rate, home_state, is_active, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Employee not found' });
  res.json(rows[0]);
});

module.exports = router;
