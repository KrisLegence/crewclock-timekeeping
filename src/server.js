require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const auditLog = require('./middleware/auditLog');

const timeEntriesRouter = require('./routes/timeEntries');
const employeesRouter   = require('./routes/employees');
const costCodesRouter    = require('./routes/costCodes');
const validationRouter   = require('./routes/validation');
const exportRouter       = require('./routes/export');
const uploadRouter       = require('./routes/upload');
const auditLogsRouter    = require('./routes/auditLogs');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use(auditLog());

app.use('/api/time-entries', timeEntriesRouter);
app.use('/api/employees',    employeesRouter);
app.use('/api/cost-codes',   costCodesRouter);
app.use('/api/validation',   validationRouter);
app.use('/api/export',       exportRouter);
app.use('/api/upload',       uploadRouter);
app.use('/api/audit-logs',   auditLogsRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Timekeeping API running on http://localhost:${PORT}`);
});
