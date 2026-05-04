const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  const { table_name, record_id, changed_by, limit } = req.query;
  let sql = `
    SELECT al.*, emp.first_name, emp.last_name
    FROM audit_logs al
    LEFT JOIN employees emp ON emp.id = al.changed_by
    WHERE 1=1
  `;
  const params = [];

  if (table_name) {
    params.push(table_name);
    sql += ` AND al.table_name = $${params.length}`;
  }
  if (record_id) {
    params.push(record_id);
    sql += ` AND al.record_id = $${params.length}`;
  }
  if (changed_by) {
    params.push(changed_by);
    sql += ` AND al.changed_by = $${params.length}`;
  }

  sql += ' ORDER BY al.created_at DESC';

  const rowLimit = Math.min(parseInt(limit) || 100, 500);
  params.push(rowLimit);
  sql += ` LIMIT $${params.length}`;

  const { rows } = await db.query(sql, params);
  res.json(rows);
});

module.exports = router;
