// ═══════════════════════════════════════════════════════════════
// SAGE 300 CRE — Payroll Transaction (.PRT) Export Adapter
// ═══════════════════════════════════════════════════════════════
// Generates a .PRT (Payroll Transaction) CSV file formatted for
// import into Sage 300 CRE Payroll module.
//
// Sage 300 CRE .PRT column spec:
//   Employee#, Trans Date, Job#, Cost Code, Category,
//   Earning Code, Hours, Amount, Workers Comp Code, Note
// ═══════════════════════════════════════════════════════════════

const { calculateDailyHours, calculateEntryPay, calculatePerDiem } = require('../logic/payrollRules');

// ─── Sage 300 Earning Codes ──────────────────────────────────
const EARNING_CODES = {
  regular:    'REG',
  overtime:   'OT',
  doubleTime: 'DT',
  perDiem:    'PERD',
};

// ─── Format a date as MM/DD/YYYY (Sage 300 expected format) ──
function formatDate(dateVal) {
  const d = new Date(dateVal);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

// ─── Escape a CSV field ──────────────────────────────────────
function csvField(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ─── Build one CSV row ───────────────────────────────────────
function buildRow(empNumber, transDate, jobNumber, costCode, category, earningCode, hours, amount, wcCode, note) {
  return [
    csvField(empNumber),
    csvField(formatDate(transDate)),
    csvField(jobNumber),
    csvField(costCode),
    csvField(category),
    csvField(earningCode),
    csvField(hours.toFixed(2)),
    csvField(amount.toFixed(2)),
    csvField(wcCode || ''),
    csvField(note || ''),
  ].join(',');
}

// ─── Generate .PRT content from time entries ─────────────────
// entries: array of enriched time entry objects:
//   { employee_number, work_date, job_number, cost_code, category,
//     hourly_rate, hours_regular, hours_overtime, hours_double,
//     per_diem, per_diem_location, wc_code, notes }
function generatePRT(entries) {
  const header = [
    'Employee#',
    'Trans Date',
    'Job#',
    'Cost Code',
    'Category',
    'Earning Code',
    'Hours',
    'Amount',
    'WC Code',
    'Note',
  ].join(',');

  const rows = [header];

  for (const e of entries) {
    const rate = Number(e.hourly_rate);

    if (Number(e.hours_regular) > 0) {
      rows.push(buildRow(
        e.employee_number, e.work_date, e.job_number, e.cost_code,
        e.category, EARNING_CODES.regular,
        Number(e.hours_regular),
        Number(e.hours_regular) * rate,
        e.wc_code, e.notes
      ));
    }

    if (Number(e.hours_overtime) > 0) {
      rows.push(buildRow(
        e.employee_number, e.work_date, e.job_number, e.cost_code,
        e.category, EARNING_CODES.overtime,
        Number(e.hours_overtime),
        Number(e.hours_overtime) * rate * 1.5,
        e.wc_code, e.notes
      ));
    }

    if (Number(e.hours_double) > 0) {
      rows.push(buildRow(
        e.employee_number, e.work_date, e.job_number, e.cost_code,
        e.category, EARNING_CODES.doubleTime,
        Number(e.hours_double),
        Number(e.hours_double) * rate * 2.0,
        e.wc_code, e.notes
      ));
    }

    if (Number(e.per_diem) > 0) {
      rows.push(buildRow(
        e.employee_number, e.work_date, e.job_number, e.cost_code,
        e.category, EARNING_CODES.perDiem,
        0,
        Number(e.per_diem),
        e.wc_code, `Per Diem - ${e.per_diem_location || 'Standard'}`
      ));
    }
  }

  return rows.join('\r\n') + '\r\n';
}

// ─── Export route handler ────────────────────────────────────
// Queries the DB for approved entries in a date range and streams
// the .PRT file as a download.
async function exportToSage300(db, startDate, endDate) {
  const sql = `
    SELECT
      emp.employee_number,
      te.work_date,
      cc.job_number,
      cc.code        AS cost_code,
      cc.category,
      emp.hourly_rate,
      te.hours_regular,
      te.hours_overtime,
      te.hours_double,
      te.per_diem,
      te.per_diem_location,
      te.notes
    FROM time_entries te
    JOIN employees emp ON emp.id = te.employee_id
    JOIN cost_codes cc  ON cc.id = te.cost_code_id
    WHERE te.status = 'approved'
      AND te.work_date BETWEEN $1 AND $2
    ORDER BY emp.employee_number, te.work_date
  `;

  const { rows } = await db.query(sql, [startDate, endDate]);
  return generatePRT(rows);
}

// ─── Build a filename that Sage 300 operators expect ─────────
function buildFilename(startDate, endDate) {
  const s = startDate.replace(/-/g, '');
  const e = endDate.replace(/-/g, '');
  return `PAYROLL_${s}_${e}.PRT`;
}

module.exports = {
  generatePRT,
  exportToSage300,
  buildFilename,
  EARNING_CODES,
};
