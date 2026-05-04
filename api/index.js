// Vercel Serverless Function — wraps the Express app
// All /api/* requests route here via vercel.json

process.env.DEMO_MODE = 'true';

const express = require('express');
const cors = require('cors');

const auditLog = require('../src/middleware/auditLog');
const timeEntriesRouter = require('../src/routes/timeEntries');
const employeesRouter = require('../src/routes/employees');
const costCodesRouter = require('../src/routes/costCodes');
const validationRouter = require('../src/routes/validation');
const exportRouter = require('../src/routes/export');
const uploadRouter = require('../src/routes/upload');
const auditLogsRouter = require('../src/routes/auditLogs');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(auditLog());

app.use('/api/time-entries', timeEntriesRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/cost-codes', costCodesRouter);
app.use('/api/validation', validationRouter);
app.use('/api/export', exportRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/audit-logs', auditLogsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = app;
