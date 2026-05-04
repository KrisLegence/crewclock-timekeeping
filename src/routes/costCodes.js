const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  const { job_number, active } = req.query;
  let sql = 'SELECT * FROM cost_codes WHERE 1=1';
  const params = [];

  if (job_number) {
    params.push(job_number);
    sql += ` AND job_number = $${params.length}`;
  }
  if (active !== undefined) {
    params.push(active === 'true');
    sql += ` AND is_active = $${params.length}`;
  }

  sql += ' ORDER BY job_number, code';
  const { rows } = await db.query(sql, params);
  res.json(rows);
});

module.exports = router;
