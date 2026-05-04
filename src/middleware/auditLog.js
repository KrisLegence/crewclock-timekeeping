// ═══════════════════════════════════════════════════════════════
// SOX AUDIT MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
// Intercepts UPDATE and DELETE requests, captures the "before"
// state, and after the response, writes both "before" and "after"
// to the audit_logs table.
// ═══════════════════════════════════════════════════════════════

const db = require('../config/db');

// Tables we audit and their primary key column
const AUDITED_TABLES = {
  '/api/time-entries': { table: 'time_entries', pk: 'id' },
  '/api/employees':    { table: 'employees',    pk: 'id' },
  '/api/cost-codes':   { table: 'cost_codes',   pk: 'id' },
};

function resolveTableConfig(path) {
  for (const [prefix, config] of Object.entries(AUDITED_TABLES)) {
    if (path.startsWith(prefix)) return config;
  }
  return null;
}

function extractRecordId(path) {
  const parts = path.split('/');
  const last = parts[parts.length - 1];
  const id = parseInt(last, 10);
  return isNaN(id) ? null : id;
}

async function fetchCurrentState(table, pk, recordId) {
  const { rows } = await db.query(
    `SELECT * FROM ${table} WHERE ${pk} = $1`,
    [recordId]
  );
  return rows[0] || null;
}

function auditLog() {
  return async (req, res, next) => {
    const method = req.method.toUpperCase();
    if (method !== 'PUT' && method !== 'PATCH' && method !== 'DELETE') {
      return next();
    }

    const tableConfig = resolveTableConfig(req.path);
    if (!tableConfig) return next();

    const recordId = extractRecordId(req.path);
    if (!recordId) return next();

    const beforeState = await fetchCurrentState(tableConfig.table, tableConfig.pk, recordId);

    const originalJson = res.json.bind(res);
    res.json = async function (body) {
      try {
        const afterState = method === 'DELETE'
          ? null
          : await fetchCurrentState(tableConfig.table, tableConfig.pk, recordId);

        const action = method === 'DELETE' ? 'DELETE' : 'UPDATE';

        await db.query(
          `INSERT INTO audit_logs
            (table_name, record_id, action, before_state, after_state,
             changed_by, change_reason, change_note, ip_address, user_agent)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            tableConfig.table,
            recordId,
            action,
            beforeState ? JSON.stringify(beforeState) : null,
            afterState  ? JSON.stringify(afterState)  : null,
            req.body?.changed_by || req.user?.id || 0,
            req.body?.reason_code || null,
            req.body?.reason_note || null,
            req.ip,
            req.get('User-Agent'),
          ]
        );
      } catch (err) {
        console.error('Audit log write failed:', err.message);
      }

      return originalJson(body);
    };

    next();
  };
}

module.exports = auditLog;
