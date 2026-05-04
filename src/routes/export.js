const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { exportToSage300, buildFilename } = require('../adapters/sage300Exporter');

// GET /api/export/sage300?start_date=2026-04-21&end_date=2026-04-27
router.get('/sage300', async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'start_date and end_date are required' });
  }

  const prtContent = await exportToSage300(db, start_date, end_date);
  const filename = buildFilename(start_date, end_date);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(prtContent);
});

// GET /api/export/sage300/preview — returns JSON instead of file download
router.get('/sage300/preview', async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'start_date and end_date are required' });
  }

  const prtContent = await exportToSage300(db, start_date, end_date);
  const lines = prtContent.trim().split('\r\n');
  const header = lines[0].split(',');
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',');
    const obj = {};
    header.forEach((h, i) => { obj[h] = vals[i]; });
    return obj;
  });

  res.json({ filename: buildFilename(start_date, end_date), row_count: rows.length, rows });
});

module.exports = router;
