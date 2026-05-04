// CrewClock Vercel Serverless API v2 — fully self-contained
// Zero require() calls. All data and logic inlined.

var PER_DIEM_RATES = {
  TX: { meals: 69, lodging: 0 }, TX_TRAVEL: { meals: 69, lodging: 166 },
  ABQ: { meals: 74, lodging: 158 }, DEFAULT: { meals: 59, lodging: 107 }
};

function calcPerDiem(loc) {
  var r = PER_DIEM_RATES[loc] || PER_DIEM_RATES.DEFAULT;
  return { amount: r.meals + r.lodging };
}

function calcHours(total) {
  if (total <= 0) return { regular: 0, overtime: 0, doubleTime: 0 };
  return {
    regular: Math.round(Math.min(total, 8) * 100) / 100,
    overtime: Math.round(Math.min(Math.max(total - 8, 0), 4) * 100) / 100,
    doubleTime: Math.round(Math.max(total - 12, 0) * 100) / 100
  };
}

function fmtDate(d) {
  var dt = new Date(d);
  var mm = String(dt.getMonth() + 1).padStart(2, '0');
  var dd = String(dt.getDate()).padStart(2, '0');
  return mm + '/' + dd + '/' + dt.getFullYear();
}

function csvF(v) {
  if (v == null) return '';
  var s = String(v);
  return (s.indexOf(',') >= 0 || s.indexOf('"') >= 0) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function makePRT(entries) {
  var h = 'Employee#,Trans Date,Job#,Cost Code,Category,Earning Code,Hours,Amount,WC Code,Note';
  var rows = [h];
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var rate = Number(e.hourly_rate);
    if (Number(e.hours_regular) > 0)
      rows.push([csvF(e.employee_number), csvF(fmtDate(e.work_date)), csvF(e.job_number), csvF(e.cost_code), csvF(e.category), 'REG', Number(e.hours_regular).toFixed(2), (Number(e.hours_regular) * rate).toFixed(2), '', ''].join(','));
    if (Number(e.hours_overtime) > 0)
      rows.push([csvF(e.employee_number), csvF(fmtDate(e.work_date)), csvF(e.job_number), csvF(e.cost_code), csvF(e.category), 'OT', Number(e.hours_overtime).toFixed(2), (Number(e.hours_overtime) * rate * 1.5).toFixed(2), '', ''].join(','));
    if (Number(e.hours_double) > 0)
      rows.push([csvF(e.employee_number), csvF(fmtDate(e.work_date)), csvF(e.job_number), csvF(e.cost_code), csvF(e.category), 'DT', Number(e.hours_double).toFixed(2), (Number(e.hours_double) * rate * 2).toFixed(2), '', ''].join(','));
    if (Number(e.per_diem) > 0)
      rows.push([csvF(e.employee_number), csvF(fmtDate(e.work_date)), csvF(e.job_number), csvF(e.cost_code), csvF(e.category), 'PERD', '0.00', Number(e.per_diem).toFixed(2), '', csvF('Per Diem - ' + (e.per_diem_location || 'Standard'))].join(','));
  }
  return rows.join('\r\n') + '\r\n';
}

var today = new Date().toISOString().split('T')[0];
var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

var DATA = {
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
    {id:15,employee_number:'EMP015',first_name:'Karen',last_name:'Clark',role:'admin',crew_id:null,hourly_rate:48.00,home_state:'TX',is_active:true}
  ],
  cost_codes: [
    {id:1,code:'0100-210',description:'Concrete Foundations',job_number:'JOB-2026-001',phase:'Phase 1',category:'Labor',is_active:true},
    {id:2,code:'0100-310',description:'Steel Erection',job_number:'JOB-2026-001',phase:'Phase 2',category:'Labor',is_active:true},
    {id:3,code:'0100-410',description:'Electrical Rough-in',job_number:'JOB-2026-001',phase:'Phase 2',category:'Labor',is_active:true},
    {id:4,code:'0200-110',description:'Site Grading',job_number:'JOB-2026-002',phase:'Phase 1',category:'Equipment',is_active:true},
    {id:5,code:'0200-210',description:'Underground Utilities',job_number:'JOB-2026-002',phase:'Phase 1',category:'Labor',is_active:true},
    {id:6,code:'0300-110',description:'Interior Framing',job_number:'JOB-2026-003',phase:'Phase 3',category:'Labor',is_active:true},
    {id:7,code:'0300-210',description:'Drywall & Finish',job_number:'JOB-2026-003',phase:'Phase 3',category:'Labor',is_active:true},
    {id:8,code:'9000-100',description:'General Conditions',job_number:'JOB-2026-001',phase:'Overhead',category:'Overhead',is_active:true}
  ],
  time_entries: [
    {id:1,employee_id:1,cost_code_id:1,work_date:yesterday,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'pending',foreman_id:1,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:null,created_at:yesterday,updated_at:yesterday},
    {id:2,employee_id:2,cost_code_id:1,work_date:yesterday,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'pending',foreman_id:1,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:null,created_at:yesterday,updated_at:yesterday},
    {id:3,employee_id:3,cost_code_id:1,work_date:yesterday,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'approved',foreman_id:1,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:10,created_at:yesterday,updated_at:yesterday},
    {id:4,employee_id:4,cost_code_id:2,work_date:yesterday,hours_regular:8,hours_overtime:2,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'approved',foreman_id:1,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:10,created_at:yesterday,updated_at:yesterday},
    {id:5,employee_id:7,cost_code_id:3,work_date:today,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:232,per_diem_location:'ABQ',source:'huddle',status:'pending',foreman_id:6,notes:null,reason_code:null,reason_note:null,created_by:6,approved_by:null,created_at:today,updated_at:today},
    {id:6,employee_id:8,cost_code_id:3,work_date:today,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:232,per_diem_location:'ABQ',source:'huddle',status:'pending',foreman_id:6,notes:null,reason_code:null,reason_note:null,created_by:6,approved_by:null,created_at:today,updated_at:today},
    {id:7,employee_id:11,cost_code_id:1,work_date:today,hours_regular:8,hours_overtime:4,hours_double:6,per_diem:0,per_diem_location:null,source:'manual',status:'pending',foreman_id:null,notes:'18h day will be flagged',reason_code:'supervisor_override',reason_note:null,created_by:10,approved_by:null,created_at:today,updated_at:today}
  ],
  audit_logs: [],
  validation_flags: []
};

var nextEntryId = 8;
var nextAuditId = 1;
var nextFlagId = 1;

function enrichEntry(te) {
  var emp = DATA.employees.find(function(e) { return e.id === te.employee_id; }) || {};
  var cc = DATA.cost_codes.find(function(c) { return c.id === te.cost_code_id; }) || {};
  return Object.assign({}, te, {
    first_name: emp.first_name, last_name: emp.last_name,
    employee_number: emp.employee_number, hourly_rate: emp.hourly_rate,
    cost_code_value: cc.code, cost_code_desc: cc.description,
    job_number: cc.job_number, category: cc.category
  });
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
  res.end(JSON.stringify(data));
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

module.exports = function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    res.end();
    return;
  }

  var parsed = parsePath(req.url);
  var p = parsed.pathname;
  var q = parsed.query;
  var m = req.method || 'GET';

  try {
    if (p === '/api/debug') return send(res, { ok: true, url: req.url, path: p, query: q, method: m });
    if (p === '/api/health') return send(res, { status: 'ok', employees: DATA.employees.length, entries: DATA.time_entries.length });

    if (p === '/api/employees' && m === 'GET') {
      var emps = DATA.employees.filter(function(e) { return e.is_active; });
      emps.sort(function(a, b) { return a.last_name.localeCompare(b.last_name); });
      return send(res, emps);
    }

    if (p === '/api/cost-codes' && m === 'GET') {
      var codes = DATA.cost_codes.filter(function(c) { return c.is_active; });
      codes.sort(function(a, b) { return a.code.localeCompare(b.code); });
      return send(res, codes);
    }

    if (p === '/api/time-entries/huddle' && m === 'POST') {
      return parseBody(req).then(function(body) {
        if (!body.employee_ids || !body.employee_ids.length) return send(res, { error: 'employee_ids required' }, 400);
        var hours = calcHours(body.total_hours || 8);
        var pd = body.per_diem_location ? calcPerDiem(body.per_diem_location) : { amount: 0 };
        var results = [];
        for (var i = 0; i < body.employee_ids.length; i++) {
          var empId = body.employee_ids[i];
          var dup = DATA.time_entries.find(function(t) { return t.employee_id === empId && t.work_date === body.work_date && t.cost_code_id === body.cost_code_id && t.status !== 'rejected'; });
          if (dup) continue;
          var entry = { id: nextEntryId++, employee_id: empId, cost_code_id: body.cost_code_id, work_date: body.work_date,
            hours_regular: hours.regular, hours_overtime: hours.overtime, hours_double: hours.doubleTime,
            per_diem: pd.amount, per_diem_location: body.per_diem_location || null,
            source: 'huddle', status: 'pending', foreman_id: body.foreman_id || 1,
            notes: body.notes || null, reason_code: null, reason_note: null,
            created_by: body.foreman_id || 1, approved_by: null,
            created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
          DATA.time_entries.push(entry);
          results.push(entry);
        }
        return send(res, { created: results.length, entries: results }, 201);
      });
    }

    if (p === '/api/time-entries' && m === 'GET') {
      var rows = DATA.time_entries.map(enrichEntry);
      if (q.status) rows = rows.filter(function(r) { return r.status === q.status; });
      if (q.date) rows = rows.filter(function(r) { return r.work_date === q.date; });
      rows.sort(function(a, b) { return (b.work_date || '').localeCompare(a.work_date || ''); });
      return send(res, rows);
    }

    if (p === '/api/time-entries' && m === 'POST') {
      return parseBody(req).then(function(body) {
        if (body.source === 'manual' && !body.reason_code) return send(res, { error: 'reason_code is required' }, 400);
        var hours = calcHours(body.total_hours || 0);
        var pd = body.per_diem_location ? calcPerDiem(body.per_diem_location) : { amount: 0 };
        var entry = { id: nextEntryId++, employee_id: body.employee_id, cost_code_id: body.cost_code_id,
          work_date: body.work_date, hours_regular: hours.regular, hours_overtime: hours.overtime,
          hours_double: hours.doubleTime, per_diem: pd.amount, per_diem_location: body.per_diem_location || null,
          source: body.source || 'manual', status: 'pending', foreman_id: body.foreman_id || null,
          notes: body.notes || null, reason_code: body.reason_code || null,
          reason_note: body.reason_note || null, created_by: body.created_by || 15, approved_by: null,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        DATA.time_entries.push(entry);
        return send(res, entry, 201);
      });
    }

    var teMatch = p.match(/^\/api\/time-entries\/(\d+)$/);
    if (teMatch && m === 'PUT') {
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

    if (p === '/api/validation/flags' && m === 'GET') {
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

    if (p === '/api/validation/run' && m === 'POST') {
      var vflags = [];
      for (var vi = 0; vi < DATA.time_entries.length; vi++) {
        var vte2 = DATA.time_entries[vi];
        if (vte2.status === 'rejected') continue;
        var vtotal = Number(vte2.hours_regular) + Number(vte2.hours_overtime) + Number(vte2.hours_double);
        if (vtotal >= 16) {
          var vemp2 = DATA.employees.find(function(e) { return e.id === vte2.employee_id; }) || {};
          vflags.push({ time_entry_id: vte2.id, flag_type: 'excessive_hours',
            flag_message: vemp2.first_name + ' ' + vemp2.last_name + ' logged ' + vtotal + 'h exceeds 16h threshold' });
        }
      }
      var ins = 0;
      for (var fi = 0; fi < vflags.length; fi++) {
        var vf2 = vflags[fi];
        var exists = DATA.validation_flags.find(function(x) { return x.time_entry_id === vf2.time_entry_id && x.flag_type === vf2.flag_type && !x.is_resolved; });
        if (exists) continue;
        DATA.validation_flags.push({ id: nextFlagId++, time_entry_id: vf2.time_entry_id, flag_type: vf2.flag_type,
          flag_message: vf2.flag_message, is_resolved: false, resolved_by: null, resolved_at: null,
          created_at: new Date().toISOString() });
        ins++;
      }
      return send(res, { scanned: vflags.length, new_flags: ins });
    }

    var fMatch = p.match(/^\/api\/validation\/flags\/(\d+)\/resolve$/);
    if (fMatch && m === 'PUT') {
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

    if (p === '/api/export/sage300/preview' && m === 'GET') {
      if (!q.start_date || !q.end_date) return send(res, { error: 'start_date and end_date required' }, 400);
      var exEntries = [];
      for (var ei = 0; ei < DATA.time_entries.length; ei++) {
        var ete = DATA.time_entries[ei];
        if (ete.status !== 'approved' || ete.work_date < q.start_date || ete.work_date > q.end_date) continue;
        var eemp = DATA.employees.find(function(e) { return e.id === ete.employee_id; }) || {};
        var ecc = DATA.cost_codes.find(function(c) { return c.id === ete.cost_code_id; }) || {};
        exEntries.push({ employee_number: eemp.employee_number, work_date: ete.work_date, job_number: ecc.job_number,
          cost_code: ecc.code, category: ecc.category, hourly_rate: eemp.hourly_rate,
          hours_regular: ete.hours_regular, hours_overtime: ete.hours_overtime, hours_double: ete.hours_double,
          per_diem: ete.per_diem, per_diem_location: ete.per_diem_location, notes: ete.notes });
      }
      var prt = makePRT(exEntries);
      var lines = prt.trim().split('\r\n');
      var hdr = lines[0].split(',');
      var pRows = [];
      for (var li = 1; li < lines.length; li++) {
        var vals = lines[li].split(',');
        var obj = {};
        for (var hi = 0; hi < hdr.length; hi++) obj[hdr[hi]] = vals[hi];
        pRows.push(obj);
      }
      var sd = q.start_date.replace(/-/g, '');
      var ed = q.end_date.replace(/-/g, '');
      return send(res, { filename: 'PAYROLL_' + sd + '_' + ed + '.PRT', row_count: pRows.length, rows: pRows });
    }

    if (p === '/api/export/sage300' && m === 'GET') {
      if (!q.start_date || !q.end_date) return send(res, { error: 'dates required' }, 400);
      var dlEntries = [];
      for (var di = 0; di < DATA.time_entries.length; di++) {
        var dte = DATA.time_entries[di];
        if (dte.status !== 'approved' || dte.work_date < q.start_date || dte.work_date > q.end_date) continue;
        var demp = DATA.employees.find(function(e) { return e.id === dte.employee_id; }) || {};
        var dcc = DATA.cost_codes.find(function(c) { return c.id === dte.cost_code_id; }) || {};
        dlEntries.push({ employee_number: demp.employee_number, work_date: dte.work_date, job_number: dcc.job_number,
          cost_code: dcc.code, category: dcc.category, hourly_rate: demp.hourly_rate,
          hours_regular: dte.hours_regular, hours_overtime: dte.hours_overtime, hours_double: dte.hours_double,
          per_diem: dte.per_diem, per_diem_location: dte.per_diem_location, notes: dte.notes });
      }
      var dlPrt = makePRT(dlEntries);
      var dlSd = q.start_date.replace(/-/g, '');
      var dlEd = q.end_date.replace(/-/g, '');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="PAYROLL_' + dlSd + '_' + dlEd + '.PRT"');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(dlPrt);
      return;
    }

    if (p === '/api/audit-logs' && m === 'GET') {
      var aRows = DATA.audit_logs.map(function(al) {
        var aemp = DATA.employees.find(function(e) { return e.id === al.changed_by; });
        return Object.assign({}, al, { first_name: aemp ? aemp.first_name : null, last_name: aemp ? aemp.last_name : null });
      });
      aRows.sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); });
      return send(res, aRows.slice(0, 100));
    }

    if (p === '/api/upload/proof-photo' && m === 'POST') {
      return send(res, { url: '/uploads/proof-photos/demo_proof.jpg' });
    }

    return send(res, { error: 'Not found', path: p, method: m }, 404);

  } catch (err) {
    return send(res, { error: String(err.message || err) }, 500);
  }
};
