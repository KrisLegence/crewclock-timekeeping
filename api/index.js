// ═══════════════════════════════════════════════════════════════
// CrewClock — Vercel Serverless API (fully self-contained)
// ═══════════════════════════════════════════════════════════════

// ─── Payroll Rules (inlined) ─────────────────────
const PER_DIEM_RATES = {
  TX:        { meals: 69, lodging: 0 },
  TX_TRAVEL: { meals: 69, lodging: 166 },
  ABQ:       { meals: 74, lodging: 158 },
  DEFAULT:   { meals: 59, lodging: 107 },
};

function calculatePerDiem(loc) {
  const r = PER_DIEM_RATES[loc] || PER_DIEM_RATES.DEFAULT;
  return { amount: r.meals + r.lodging };
}

function calculateDailyHours(total) {
  if (total <= 0) return { regular: 0, overtime: 0, doubleTime: 0 };
  return {
    regular:    Math.round(Math.min(total, 8) * 100) / 100,
    overtime:   Math.round(Math.min(Math.max(total - 8, 0), 4) * 100) / 100,
    doubleTime: Math.round(Math.max(total - 12, 0) * 100) / 100,
  };
}

// ─── PRT Export (inlined) ────────────────────────
function formatDate(d) {
  const dt = new Date(d);
  return `${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}/${dt.getFullYear()}`;
}
function csvF(v) {
  if (v == null) return '';
  const s = String(v);
  return (s.includes(',') || s.includes('"')) ? `"${s.replace(/"/g,'""')}"` : s;
}
function generatePRT(entries) {
  const h = 'Employee#,Trans Date,Job#,Cost Code,Category,Earning Code,Hours,Amount,WC Code,Note';
  const rows = [h];
  for (const e of entries) {
    const rate = Number(e.hourly_rate);
    if (Number(e.hours_regular) > 0)
      rows.push([csvF(e.employee_number),csvF(formatDate(e.work_date)),csvF(e.job_number),csvF(e.cost_code),csvF(e.category),'REG',Number(e.hours_regular).toFixed(2),(Number(e.hours_regular)*rate).toFixed(2),'',''].join(','));
    if (Number(e.hours_overtime) > 0)
      rows.push([csvF(e.employee_number),csvF(formatDate(e.work_date)),csvF(e.job_number),csvF(e.cost_code),csvF(e.category),'OT',Number(e.hours_overtime).toFixed(2),(Number(e.hours_overtime)*rate*1.5).toFixed(2),'',''].join(','));
    if (Number(e.hours_double) > 0)
      rows.push([csvF(e.employee_number),csvF(formatDate(e.work_date)),csvF(e.job_number),csvF(e.cost_code),csvF(e.category),'DT',Number(e.hours_double).toFixed(2),(Number(e.hours_double)*rate*2).toFixed(2),'',''].join(','));
    if (Number(e.per_diem) > 0)
      rows.push([csvF(e.employee_number),csvF(formatDate(e.work_date)),csvF(e.job_number),csvF(e.cost_code),csvF(e.category),'PERD','0.00',Number(e.per_diem).toFixed(2),'',csvF('Per Diem - '+(e.per_diem_location||'Standard'))].join(','));
  }
  return rows.join('\r\n') + '\r\n';
}

// ─── Seed Data ───────────────────────────────────
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const DATA = {
  employees: [
    {id:1,employee_number:'EMP001',first_name:'Carlos',last_name:'Martinez',role:'foreman',crew_id:1,hourly_rate:42.50,home_state:'TX',is_active:true},
    {id:2,employee_number:'EMP002',first_name:'James',last_name:'Wilson',role:'worker',crew_id:1,hourly_rate:35.00,home_state:'TX',is_active:true},
    {id:3,employee_number:'EMP003',first_name:'Maria',last_name:'Garcia',role:'worker',crew_id:1,hourly_rate:35.00,home_state:'TX',is_active:true},
    {id:4,employee_number:'EMP004',first_name:'Robert',last_name:'Johnson',role:'worker',crew_id:1,hourly_rate:34.00,home_state:'TX',is_active:true},
    {id:5,employee_number:'EMP005',first_name:'David',last_name:'Brown',role:'worker',crew_id:1,hourly_rate:33.50,home_state:'TX',is_active:true},
    {id:6,employee_number:'EMP006',first_name:'Sarah',last_name:'Davis',role:'foreman',crew_id:2,hourly_rate:43.00,home_state:'TX',is_active:true},
    {id:7,employee_number:'EMP007',first_name:'Michael',last_name:'Thompson',role:'worker',crew_id:2,hourly_rate:36.00,home_state:'NM',is_active:true},
    {id:8,employee_number:'EMP008',first_name:'Jennifer',last_name:'Anderson',role:'worker',crew_id:2,hourly_rate:34.50,home_state:'NM',is_active:true},
    {id:9,employee_number:'EMP009',first_name:'William',last_name:'Taylor',role:'worker',crew_id:2,hourly_rate:35.50,home_state:'TX',is_active:true},
    {id:10,employee_number:'EMP010',first_name:'Linda',last_name:'Thomas',role:'supervisor',crew_id:null,hourly_rate:55.00,home_state:'TX',is_active:true},
    {id:11,employee_number:'EMP011',first_name:'Richard',last_name:'Jackson',role:'worker',crew_id:1,hourly_rate:33.00,home_state:'TX',is_active:true},
    {id:12,employee_number:'EMP012',first_name:'Patricia',last_name:'White',role:'worker',crew_id:1,hourly_rate:34.00,home_state:'TX',is_active:true},
    {id:13,employee_number:'EMP013',first_name:'Jose',last_name:'Hernandez',role:'worker',crew_id:2,hourly_rate:35.00,home_state:'NM',is_active:true},
    {id:14,employee_number:'EMP014',first_name:'Daniel',last_name:'Moore',role:'worker',crew_id:2,hourly_rate:33.50,home_state:'TX',is_active:true},
    {id:15,employee_number:'EMP015',first_name:'Karen',last_name:'Clark',role:'admin',crew_id:null,hourly_rate:48.00,home_state:'TX',is_active:true},
  ],
  cost_codes: [
    {id:1,code:'0100-210',description:'Concrete Foundations',job_number:'JOB-2026-001',phase:'Phase 1',category:'Labor',is_active:true},
    {id:2,code:'0100-310',description:'Steel Erection',job_number:'JOB-2026-001',phase:'Phase 2',category:'Labor',is_active:true},
    {id:3,code:'0100-410',description:'Electrical Rough-in',job_number:'JOB-2026-001',phase:'Phase 2',category:'Labor',is_active:true},
    {id:4,code:'0200-110',description:'Site Grading',job_number:'JOB-2026-002',phase:'Phase 1',category:'Equipment',is_active:true},
    {id:5,code:'0200-210',description:'Underground Utilities',job_number:'JOB-2026-002',phase:'Phase 1',category:'Labor',is_active:true},
    {id:6,code:'0300-110',description:'Interior Framing',job_number:'JOB-2026-003',phase:'Phase 3',category:'Labor',is_active:true},
    {id:7,code:'0300-210',description:'Drywall & Finish',job_number:'JOB-2026-003',phase:'Phase 3',category:'Labor',is_active:true},
    {id:8,code:'9000-100',description:'General Conditions',job_number:'JOB-2026-001',phase:'Overhead',category:'Overhead',is_active:true},
  ],
  time_entries: [
    {id:1,employee_id:1,cost_code_id:1,work_date:yesterday,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'pending',foreman_id:1,proof_photo_url:null,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:null,created_at:yesterday,updated_at:yesterday},
    {id:2,employee_id:2,cost_code_id:1,work_date:yesterday,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'pending',foreman_id:1,proof_photo_url:null,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:null,created_at:yesterday,updated_at:yesterday},
    {id:3,employee_id:3,cost_code_id:1,work_date:yesterday,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'approved',foreman_id:1,proof_photo_url:null,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:10,created_at:yesterday,updated_at:yesterday},
    {id:4,employee_id:4,cost_code_id:2,work_date:yesterday,hours_regular:8,hours_overtime:2,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'approved',foreman_id:1,proof_photo_url:null,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:10,created_at:yesterday,updated_at:yesterday},
    {id:5,employee_id:7,cost_code_id:3,work_date:today,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:232,per_diem_location:'ABQ',source:'huddle',status:'pending',foreman_id:6,proof_photo_url:null,notes:null,reason_code:null,reason_note:null,created_by:6,approved_by:null,created_at:today,updated_at:today},
    {id:6,employee_id:8,cost_code_id:3,work_date:today,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:232,per_diem_location:'ABQ',source:'huddle',status:'pending',foreman_id:6,proof_photo_url:null,notes:null,reason_code:null,reason_note:null,created_by:6,approved_by:null,created_at:today,updated_at:today},
    {id:7,employee_id:11,cost_code_id:1,work_date:today,hours_regular:8,hours_overtime:4,hours_double:6,per_diem:0,per_diem_location:null,source:'manual',status:'pending',foreman_id:null,proof_photo_url:null,notes:'18h day — will be flagged',reason_code:'supervisor_override',reason_note:null,created_by:10,approved_by:null,created_at:today,updated_at:today},
  ],
  audit_logs: [],
  validation_flags: [],
};

let nextEntryId = 8, nextAuditId = 1, nextFlagId = 1;

function enrichEntry(te) {
  const emp = DATA.employees.find(e => e.id === te.employee_id) || {};
  const cc = DATA.cost_codes.find(c => c.id === te.cost_code_id) || {};
  return { ...te, first_name: emp.first_name, last_name: emp.last_name,
    employee_number: emp.employee_number, hourly_rate: emp.hourly_rate,
    cost_code_value: cc.code, cost_code_desc: cc.description,
    job_number: cc.job_number, category: cc.category };
}

function parseBody(req) {
  return new Promise(function(resolve) {
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) return resolve(req.body);
    var data = '';
    req.on('data', function(c) { data += c; });
    req.on('end', function() { try { resolve(JSON.parse(data)); } catch(e) { resolve({}); } });
  });
}

function send(res, data, status) {
  res.statusCode = status || 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return res.end(JSON.stringify(data));
}

function parsePath(reqUrl) {
  var raw = reqUrl || '/';
  var qIdx = raw.indexOf('?');
  var pathname = qIdx >= 0 ? raw.substring(0, qIdx) : raw;
  var qs = qIdx >= 0 ? raw.substring(qIdx + 1) : '';
  pathname = pathname.replace(/\/+$/, '') || '/';
  var query = {};
  if (qs) {
    qs.split('&').forEach(function(pair) {
      var parts = pair.split('=');
      if (parts[0]) query[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
    });
  }
  return { pathname: pathname, query: query };
}

module.exports = function(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
  }

  var parsed = parsePath(req.url);
  var pathname = parsed.pathname;
  var query = parsed.query;
  var method = req.method || 'GET';

  // ── Debug ──
  if (pathname === '/api/debug') {
    return send(res, { ok: true, reqUrl: req.url, pathname: pathname, query: query, method: method });
  }

  // ── Health ──
  if (pathname === '/api/health') {
    return send(res, { status: 'ok', employees: DATA.employees.length, entries: DATA.time_entries.length });
  }

  // ── GET /api/employees ──
  if (pathname === '/api/employees' && method === 'GET') {
    var emps = DATA.employees.filter(function(e) { return e.is_active; });
    emps.sort(function(a, b) { return a.last_name.localeCompare(b.last_name); });
    return send(res, emps);
  }

  // ── GET /api/cost-codes ──
  if (pathname === '/api/cost-codes' && method === 'GET') {
    var codes = DATA.cost_codes.filter(function(c) { return c.is_active; });
    codes.sort(function(a, b) { return a.code.localeCompare(b.code); });
    return send(res, codes);
  }

  // ── POST /api/time-entries/huddle ──
  if (pathname === '/api/time-entries/huddle' && method === 'POST') {
    return parseBody(req).then(function(body) {
      if (!Array.isArray(body.employee_ids) || !body.employee_ids.length) return send(res, { error: 'employee_ids required' }, 400);
      var hours = calculateDailyHours(body.total_hours || 8);
      var perDiem = body.per_diem_location ? calculatePerDiem(body.per_diem_location) : { amount: 0 };
      var results = [];
      body.employee_ids.forEach(function(empId) {
        var dup = DATA.time_entries.find(function(t) { return t.employee_id === empId && t.work_date === body.work_date && t.cost_code_id === body.cost_code_id && t.status !== 'rejected'; });
        if (dup) return;
        var entry = { id: nextEntryId++, employee_id: empId, cost_code_id: body.cost_code_id, work_date: body.work_date,
          hours_regular: hours.regular, hours_overtime: hours.overtime, hours_double: hours.doubleTime,
          per_diem: perDiem.amount, per_diem_location: body.per_diem_location || null,
          source: 'huddle', status: 'pending', foreman_id: body.foreman_id || 1,
          proof_photo_url: null, notes: body.notes || null, reason_code: null, reason_note: null,
          created_by: body.foreman_id || 1, approved_by: null,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        DATA.time_entries.push(entry);
        results.push(entry);
      });
      return send(res, { created: results.length, entries: results }, 201);
    });
  }

  // ── GET /api/time-entries ──
  if (pathname === '/api/time-entries' && method === 'GET') {
    var rows = DATA.time_entries.map(enrichEntry);
    if (query.status) rows = rows.filter(function(r) { return r.status === query.status; });
    if (query.date) rows = rows.filter(function(r) { return r.work_date === query.date; });
    rows.sort(function(a, b) { return (b.work_date || '').localeCompare(a.work_date || ''); });
    return send(res, rows);
  }

  // ── POST /api/time-entries ──
  if (pathname === '/api/time-entries' && method === 'POST') {
    return parseBody(req).then(function(body) {
      if (body.source === 'manual' && !body.reason_code) return send(res, { error: 'reason_code is required for manual entries' }, 400);
      var hours = calculateDailyHours(body.total_hours || 0);
      var perDiem = body.per_diem_location ? calculatePerDiem(body.per_diem_location) : { amount: 0 };
      var entry = { id: nextEntryId++, employee_id: body.employee_id, cost_code_id: body.cost_code_id,
        work_date: body.work_date, hours_regular: hours.regular, hours_overtime: hours.overtime,
        hours_double: hours.doubleTime, per_diem: perDiem.amount, per_diem_location: body.per_diem_location || null,
        source: body.source || 'manual', status: 'pending', foreman_id: body.foreman_id || null,
        proof_photo_url: null, notes: body.notes || null, reason_code: body.reason_code || null,
        reason_note: body.reason_note || null, created_by: body.created_by || 15, approved_by: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      DATA.time_entries.push(entry);
      return send(res, entry, 201);
    });
  }

  // ── PUT /api/time-entries/:id ──
  var teMatch = pathname.match(/^\/api\/time-entries\/(\d+)$/);
  if (teMatch && method === 'PUT') {
    var teId = parseInt(teMatch[1]);
    return parseBody(req).then(function(body) {
      var te = DATA.time_entries.find(function(e) { return e.id === teId; });
      if (!te) return send(res, { error: 'Not found' }, 404);
      var before = JSON.parse(JSON.stringify(te));
      if (body.status) te.status = body.status;
      if (body.cost_code_id) te.cost_code_id = body.cost_code_id;
      if (body.reason_code) te.reason_code = body.reason_code;
      if (body.reason_note) te.reason_note = body.reason_note;
      if (body.approved_by) te.approved_by = body.approved_by;
      if (body.status === 'approved') te.approved_at = new Date().toISOString();
      te.updated_at = new Date().toISOString();
      DATA.audit_logs.push({ id: nextAuditId++, table_name: 'time_entries', record_id: teId,
        action: 'UPDATE', before_state: before, after_state: JSON.parse(JSON.stringify(te)),
        changed_by: body.changed_by || body.approved_by || 0,
        change_reason: body.reason_code || null, change_note: body.reason_note || null,
        ip_address: null, user_agent: req.headers['user-agent'] || null,
        created_at: new Date().toISOString() });
      return send(res, te);
    });
  }

  // ── GET /api/validation/flags ──
  if (pathname === '/api/validation/flags' && method === 'GET') {
    var vrows = DATA.validation_flags.filter(function(f) { return !f.is_resolved; }).map(function(vf) {
      var vte = DATA.time_entries.find(function(t) { return t.id === vf.time_entry_id; }) || {};
      var vemp = DATA.employees.find(function(e) { return e.id === vte.employee_id; }) || {};
      var vcc = DATA.cost_codes.find(function(c) { return c.id === vte.cost_code_id; }) || {};
      return Object.assign({}, vf, { work_date: vte.work_date, hours_regular: vte.hours_regular,
        hours_overtime: vte.hours_overtime, hours_double: vte.hours_double,
        entry_status: vte.status, source: vte.source, first_name: vemp.first_name,
        last_name: vemp.last_name, employee_number: vemp.employee_number,
        cost_code_value: vcc.code, job_number: vcc.job_number });
    });
    return send(res, vrows);
  }

  // ── POST /api/validation/run ──
  if (pathname === '/api/validation/run' && method === 'POST') {
    var vflags = [];
    DATA.time_entries.forEach(function(te) {
      if (te.status === 'rejected') return;
      var total = Number(te.hours_regular) + Number(te.hours_overtime) + Number(te.hours_double);
      if (total >= 16) {
        var emp = DATA.employees.find(function(e) { return e.id === te.employee_id; }) || {};
        vflags.push({ time_entry_id: te.id, flag_type: 'excessive_hours',
          flag_message: emp.first_name + ' ' + emp.last_name + ' logged ' + total + 'h — exceeds 16h threshold' });
      }
    });
    var ins = 0;
    vflags.forEach(function(f) {
      if (DATA.validation_flags.find(function(x) { return x.time_entry_id === f.time_entry_id && x.flag_type === f.flag_type && !x.is_resolved; })) return;
      DATA.validation_flags.push({ id: nextFlagId++, time_entry_id: f.time_entry_id, flag_type: f.flag_type,
        flag_message: f.flag_message, is_resolved: false, resolved_by: null, resolved_at: null,
        created_at: new Date().toISOString() });
      ins++;
    });
    return send(res, { scanned: vflags.length, new_flags: ins });
  }

  // ── PUT /api/validation/flags/:id/resolve ──
  var fMatch = pathname.match(/^\/api\/validation\/flags\/(\d+)\/resolve$/);
  if (fMatch && method === 'PUT') {
    var fId = parseInt(fMatch[1]);
    return parseBody(req).then(function(body) {
      var flag = DATA.validation_flags.find(function(f) { return f.id === fId; });
      if (!flag) return send(res, { error: 'Not found' }, 404);
      flag.is_resolved = true;
      flag.resolved_by = body.resolved_by || 10;
      flag.resolved_at = new Date().toISOString();
      return send(res, flag);
    });
  }

  // ── GET /api/export/sage300/preview ──
  if (pathname === '/api/export/sage300/preview' && method === 'GET') {
    if (!query.start_date || !query.end_date) return send(res, { error: 'start_date and end_date required' }, 400);
    var exEntries = DATA.time_entries.filter(function(te) { return te.status === 'approved' && te.work_date >= query.start_date && te.work_date <= query.end_date; })
      .map(function(te) { var emp = DATA.employees.find(function(e) { return e.id === te.employee_id; }) || {}; var cc = DATA.cost_codes.find(function(c) { return c.id === te.cost_code_id; }) || {};
        return { employee_number: emp.employee_number, work_date: te.work_date, job_number: cc.job_number, cost_code: cc.code, category: cc.category, hourly_rate: emp.hourly_rate,
          hours_regular: te.hours_regular, hours_overtime: te.hours_overtime, hours_double: te.hours_double, per_diem: te.per_diem, per_diem_location: te.per_diem_location, notes: te.notes }; });
    var prt = generatePRT(exEntries);
    var lines = prt.trim().split('\r\n');
    var hdr = lines[0].split(',');
    var pRows = lines.slice(1).map(function(line) { var vals = line.split(','); var obj = {}; hdr.forEach(function(h, i) { obj[h] = vals[i]; }); return obj; });
    var sd = query.start_date.replace(/-/g,''), ed = query.end_date.replace(/-/g,'');
    return send(res, { filename: 'PAYROLL_'+sd+'_'+ed+'.PRT', row_count: pRows.length, rows: pRows });
  }

  // ── GET /api/export/sage300 ──
  if (pathname === '/api/export/sage300' && method === 'GET') {
    if (!query.start_date || !query.end_date) return send(res, { error: 'dates required' }, 400);
    var dlEntries = DATA.time_entries.filter(function(te) { return te.status === 'approved' && te.work_date >= query.start_date && te.work_date <= query.end_date; })
      .map(function(te) { var emp = DATA.employees.find(function(e) { return e.id === te.employee_id; }) || {}; var cc = DATA.cost_codes.find(function(c) { return c.id === te.cost_code_id; }) || {};
        return { employee_number: emp.employee_number, work_date: te.work_date, job_number: cc.job_number, cost_code: cc.code, category: cc.category, hourly_rate: emp.hourly_rate,
          hours_regular: te.hours_regular, hours_overtime: te.hours_overtime, hours_double: te.hours_double, per_diem: te.per_diem, per_diem_location: te.per_diem_location, notes: te.notes }; });
    var dlPrt = generatePRT(dlEntries);
    var dlSd = query.start_date.replace(/-/g,''), dlEd = query.end_date.replace(/-/g,'');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="PAYROLL_'+dlSd+'_'+dlEd+'.PRT"');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.end(dlPrt);
  }

  // ── GET /api/audit-logs ──
  if (pathname === '/api/audit-logs' && method === 'GET') {
    var aRows = DATA.audit_logs.map(function(al) {
      var emp = DATA.employees.find(function(e) { return e.id === al.changed_by; });
      return Object.assign({}, al, { first_name: emp ? emp.first_name : null, last_name: emp ? emp.last_name : null });
    });
    aRows.sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); });
    return send(res, aRows.slice(0, 100));
  }

  // ── POST /api/upload/proof-photo ──
  if (pathname === '/api/upload/proof-photo' && method === 'POST') {
    return send(res, { url: '/uploads/proof-photos/demo_proof.jpg' });
  }

  return send(res, { error: 'Not found', pathname: pathname, method: method }, 404);
};
