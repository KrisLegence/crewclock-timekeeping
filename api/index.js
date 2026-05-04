// --- Module-scope state: persists between requests on a warm Vercel instance ---

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
      rows.push([csvF(e.employee_number),csvF(fmtDate(e.work_date)),csvF(e.job_number),csvF(e.cost_code),csvF(e.category),'REG',Number(e.hours_regular).toFixed(2),(Number(e.hours_regular)*rate).toFixed(2),'',''].join(','));
    if (Number(e.hours_overtime) > 0)
      rows.push([csvF(e.employee_number),csvF(fmtDate(e.work_date)),csvF(e.job_number),csvF(e.cost_code),csvF(e.category),'OT',Number(e.hours_overtime).toFixed(2),(Number(e.hours_overtime)*rate*1.5).toFixed(2),'',''].join(','));
    if (Number(e.hours_double) > 0)
      rows.push([csvF(e.employee_number),csvF(fmtDate(e.work_date)),csvF(e.job_number),csvF(e.cost_code),csvF(e.category),'DT',Number(e.hours_double).toFixed(2),(Number(e.hours_double)*rate*2).toFixed(2),'',''].join(','));
    if (Number(e.per_diem) > 0)
      rows.push([csvF(e.employee_number),csvF(fmtDate(e.work_date)),csvF(e.job_number),csvF(e.cost_code),csvF(e.category),'PERD','0.00',Number(e.per_diem).toFixed(2),'',csvF('Per Diem - '+(e.per_diem_location||'Standard'))].join(','));
  }
  return rows.join('\r\n') + '\r\n';
}

var _initDate = new Date().toISOString().split('T')[0];
var _yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
var _morning = _initDate + 'T06:30:00.000Z';

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
    {id:1,employee_id:1,cost_code_id:1,work_date:_yesterday,clock_in:_yesterday+'T06:00:00.000Z',clock_out:_yesterday+'T14:00:00.000Z',hours_regular:8,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'pending',foreman_id:1,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:null,created_at:_yesterday,updated_at:_yesterday},
    {id:2,employee_id:2,cost_code_id:1,work_date:_yesterday,clock_in:_yesterday+'T06:00:00.000Z',clock_out:_yesterday+'T14:00:00.000Z',hours_regular:8,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'pending',foreman_id:1,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:null,created_at:_yesterday,updated_at:_yesterday},
    {id:3,employee_id:3,cost_code_id:1,work_date:_yesterday,clock_in:_yesterday+'T06:00:00.000Z',clock_out:_yesterday+'T14:00:00.000Z',hours_regular:8,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'approved',foreman_id:1,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:10,created_at:_yesterday,updated_at:_yesterday},
    {id:4,employee_id:4,cost_code_id:2,work_date:_yesterday,clock_in:_yesterday+'T06:00:00.000Z',clock_out:_yesterday+'T16:00:00.000Z',hours_regular:8,hours_overtime:2,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'approved',foreman_id:1,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:10,created_at:_yesterday,updated_at:_yesterday},
    {id:5,employee_id:7,cost_code_id:3,work_date:_initDate,clock_in:_morning,clock_out:null,hours_regular:0,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'clocked_in',foreman_id:6,notes:null,reason_code:null,reason_note:null,created_by:6,approved_by:null,created_at:_initDate,updated_at:_initDate},
    {id:6,employee_id:8,cost_code_id:null,work_date:_initDate,clock_in:_morning,clock_out:null,hours_regular:0,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'clocked_in',foreman_id:6,notes:null,reason_code:null,reason_note:null,created_by:6,approved_by:null,created_at:_initDate,updated_at:_initDate},
    {id:7,employee_id:13,cost_code_id:null,work_date:_initDate,clock_in:_morning,clock_out:null,hours_regular:0,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'clocked_in',foreman_id:6,notes:null,reason_code:null,reason_note:null,created_by:6,approved_by:null,created_at:_initDate,updated_at:_initDate},
    {id:8,employee_id:11,cost_code_id:1,work_date:_initDate,clock_in:_initDate+'T05:00:00.000Z',clock_out:_initDate+'T23:00:00.000Z',hours_regular:8,hours_overtime:4,hours_double:6,per_diem:0,per_diem_location:null,source:'manual',status:'pending',foreman_id:null,notes:'18h day will be flagged',reason_code:'supervisor_override',reason_note:null,created_by:10,approved_by:null,created_at:_initDate,updated_at:_initDate}
  ],
  audit_logs: [],
  validation_flags: []
};

var nextEntryId = 9;
var nextAuditId = 1;
var nextFlagId = 1;

function enrichEntry(te) {
  var emp = null; var cc = null;
  for (var i = 0; i < DATA.employees.length; i++) { if (DATA.employees[i].id === te.employee_id) { emp = DATA.employees[i]; break; } }
  if (te.cost_code_id) { for (var j = 0; j < DATA.cost_codes.length; j++) { if (DATA.cost_codes[j].id === te.cost_code_id) { cc = DATA.cost_codes[j]; break; } } }
  emp = emp || {}; cc = cc || {};
  var result = {};
  var keys = Object.keys(te);
  for (var k = 0; k < keys.length; k++) result[keys[k]] = te[keys[k]];
  result.first_name = emp.first_name; result.last_name = emp.last_name;
  result.employee_number = emp.employee_number; result.hourly_rate = emp.hourly_rate;
  result.cost_code_value = cc.code || null; result.cost_code_desc = cc.description || null;
  result.job_number = cc.job_number || null; result.category = cc.category || null;
  return result;
}

// --- Handler: only request-specific logic ---

module.exports = function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

    var raw = req.url || '/';
    var qIdx = raw.indexOf('?');
    var p = (qIdx >= 0 ? raw.substring(0, qIdx) : raw).replace(/\/+$/, '') || '/';
    var qs = qIdx >= 0 ? raw.substring(qIdx + 1) : '';
    var q = {};
    if (qs) { qs.split('&').forEach(function(pair) { var parts = pair.split('='); if (parts[0]) q[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || ''); }); }
    var m = req.method || 'GET';

    function send(data, status) {
      res.statusCode = status || 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    }

    function parseBody() {
      return new Promise(function(resolve) {
        if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) return resolve(req.body);
        var data = '';
        req.on('data', function(c) { data += c; });
        req.on('end', function() { try { resolve(JSON.parse(data)); } catch(e) { resolve({}); } });
      });
    }

    // --- routes ---

    if (p === '/api/debug' || p === '/api') {
      return send({ ok: true, url: raw, path: p, method: m, entries: DATA.time_entries.length, nodeVersion: process.version });
    }

    if (p === '/api/health') {
      var ciCount = 0;
      for (var hi = 0; hi < DATA.time_entries.length; hi++) { if (DATA.time_entries[hi].status === 'clocked_in') ciCount++; }
      return send({ status: 'ok', employees: DATA.employees.length, entries: DATA.time_entries.length, clocked_in: ciCount, ts: new Date().toISOString() });
    }

    if (p === '/api/employees' && m === 'GET') {
      var emps = DATA.employees.filter(function(e) { return e.is_active; });
      emps.sort(function(a, b) { return a.last_name.localeCompare(b.last_name); });
      return send(emps);
    }

    if (p === '/api/cost-codes' && m === 'GET') {
      var codes = DATA.cost_codes.filter(function(c) { return c.is_active; });
      codes.sort(function(a, b) { return a.code.localeCompare(b.code); });
      return send(codes);
    }

    // PUNCH IN
    if (p === '/api/time-entries/punch-in' && m === 'POST') {
      return parseBody().then(function(body) {
        if (!body.employee_ids || !body.employee_ids.length) return send({ error: 'employee_ids required' }, 400);
        var punchTime = body.clock_in || new Date().toISOString();
        var workDate = punchTime.split('T')[0];
        var results = [];
        var alreadyIn = [];
        for (var i = 0; i < body.employee_ids.length; i++) {
          var empId = body.employee_ids[i];
          var already = false;
          for (var di = 0; di < DATA.time_entries.length; di++) {
            var t = DATA.time_entries[di];
            if (t.employee_id === empId && t.work_date === workDate && t.status === 'clocked_in') { already = true; break; }
          }
          if (already) {
            var ae = null;
            for (var ai = 0; ai < DATA.employees.length; ai++) { if (DATA.employees[ai].id === empId) { ae = DATA.employees[ai]; break; } }
            alreadyIn.push(ae ? ae.first_name + ' ' + ae.last_name : 'ID ' + empId);
            continue;
          }
          var entry = {
            id: nextEntryId++, employee_id: empId, cost_code_id: null, work_date: workDate,
            clock_in: punchTime, clock_out: null,
            hours_regular: 0, hours_overtime: 0, hours_double: 0,
            per_diem: 0, per_diem_location: null,
            source: 'huddle', status: 'clocked_in', foreman_id: body.foreman_id || 1,
            notes: null, reason_code: null, reason_note: null,
            created_by: body.foreman_id || 1, approved_by: null,
            created_at: new Date().toISOString(), updated_at: new Date().toISOString()
          };
          DATA.time_entries.push(entry);
          results.push(enrichEntry(entry));
        }
        return send({ punched_in: results.length, already_clocked_in: alreadyIn, entries: results }, 201);
      });
    }

    // PUNCH OUT
    if (p === '/api/time-entries/punch-out' && m === 'POST') {
      return parseBody().then(function(body) {
        if (!body.entry_ids || !body.entry_ids.length) return send({ error: 'entry_ids required' }, 400);
        var punchTime = body.clock_out || new Date().toISOString();
        var results = [];
        for (var i = 0; i < body.entry_ids.length; i++) {
          var entryId = body.entry_ids[i];
          var te = null;
          for (var j = 0; j < DATA.time_entries.length; j++) { if (DATA.time_entries[j].id === entryId) { te = DATA.time_entries[j]; break; } }
          if (!te || te.status !== 'clocked_in') continue;
          var before = JSON.parse(JSON.stringify(te));
          te.clock_out = punchTime;
          var diffMs = new Date(punchTime).getTime() - new Date(te.clock_in).getTime();
          var totalHours = Math.round((diffMs / 3600000) * 100) / 100;
          if (totalHours < 0) totalHours = 0;
          var hrs = calcHours(totalHours);
          te.hours_regular = hrs.regular;
          te.hours_overtime = hrs.overtime;
          te.hours_double = hrs.doubleTime;
          te.status = 'pending';
          te.updated_at = new Date().toISOString();
          DATA.audit_logs.push({ id: nextAuditId++, table_name: 'time_entries', record_id: te.id,
            action: 'PUNCH_OUT', before_state: before, after_state: JSON.parse(JSON.stringify(te)),
            changed_by: body.foreman_id || 1, change_reason: 'punch_out', change_note: 'Clocked out by foreman',
            ip_address: null, user_agent: req.headers['user-agent'] || null,
            created_at: new Date().toISOString() });
          results.push(enrichEntry(te));
        }
        return send({ punched_out: results.length, entries: results });
      });
    }

    // CLOCKED-IN list
    if (p === '/api/time-entries/clocked-in' && m === 'GET') {
      var clockedRows = [];
      for (var ci = 0; ci < DATA.time_entries.length; ci++) {
        if (DATA.time_entries[ci].status === 'clocked_in') clockedRows.push(enrichEntry(DATA.time_entries[ci]));
      }
      clockedRows.sort(function(a, b) { return (a.last_name || '').localeCompare(b.last_name || ''); });
      return send(clockedRows);
    }

    // ALL TIME ENTRIES
    if (p === '/api/time-entries' && m === 'GET') {
      var rows = [];
      for (var ri = 0; ri < DATA.time_entries.length; ri++) rows.push(enrichEntry(DATA.time_entries[ri]));
      if (q.status) rows = rows.filter(function(r) { return r.status === q.status; });
      if (q.date) rows = rows.filter(function(r) { return r.work_date === q.date; });
      rows.sort(function(a, b) { return (b.work_date || '').localeCompare(a.work_date || ''); });
      return send(rows);
    }

    // MANUAL ENTRY
    if (p === '/api/time-entries' && m === 'POST') {
      return parseBody().then(function(body) {
        if (body.source === 'manual' && !body.reason_code) return send({ error: 'reason_code is required' }, 400);
        var hours = calcHours(body.total_hours || 0);
        var pd = body.per_diem_location ? calcPerDiem(body.per_diem_location) : { amount: 0 };
        var entry = { id: nextEntryId++, employee_id: body.employee_id, cost_code_id: body.cost_code_id,
          work_date: body.work_date, clock_in: body.clock_in || null, clock_out: body.clock_out || null,
          hours_regular: hours.regular, hours_overtime: hours.overtime,
          hours_double: hours.doubleTime, per_diem: pd.amount, per_diem_location: body.per_diem_location || null,
          source: body.source || 'manual', status: 'pending', foreman_id: body.foreman_id || null,
          notes: body.notes || null, reason_code: body.reason_code || null,
          reason_note: body.reason_note || null, created_by: body.created_by || 15, approved_by: null,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        DATA.time_entries.push(entry);
        return send(entry, 201);
      });
    }

    // UPDATE ENTRY (approve, assign cost code, etc.)
    var teMatch = p.match(/^\/api\/time-entries\/(\d+)$/);
    if (teMatch && m === 'PUT') {
      var teId = parseInt(teMatch[1]);
      return parseBody().then(function(body) {
        var te = null;
        for (var i = 0; i < DATA.time_entries.length; i++) { if (DATA.time_entries[i].id === teId) { te = DATA.time_entries[i]; break; } }
        if (!te) return send({ error: 'Not found' }, 404);
        var before = JSON.parse(JSON.stringify(te));
        if (body.status) te.status = body.status;
        if (body.cost_code_id) te.cost_code_id = body.cost_code_id;
        if (body.per_diem_location !== undefined) {
          te.per_diem_location = body.per_diem_location || null;
          te.per_diem = body.per_diem_location ? calcPerDiem(body.per_diem_location).amount : 0;
        }
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
        return send(te);
      });
    }

    // VALIDATION FLAGS
    if (p === '/api/validation/flags' && m === 'GET') {
      var vrows = [];
      for (var vi = 0; vi < DATA.validation_flags.length; vi++) {
        var vf = DATA.validation_flags[vi];
        if (vf.is_resolved) continue;
        var vte = null; var vemp = null; var vcc = null;
        for (var a = 0; a < DATA.time_entries.length; a++) { if (DATA.time_entries[a].id === vf.time_entry_id) { vte = DATA.time_entries[a]; break; } }
        vte = vte || {};
        for (var b = 0; b < DATA.employees.length; b++) { if (DATA.employees[b].id === vte.employee_id) { vemp = DATA.employees[b]; break; } }
        if (vte.cost_code_id) { for (var c = 0; c < DATA.cost_codes.length; c++) { if (DATA.cost_codes[c].id === vte.cost_code_id) { vcc = DATA.cost_codes[c]; break; } } }
        vemp = vemp || {}; vcc = vcc || {};
        var row = {};
        var vfKeys = Object.keys(vf);
        for (var vk = 0; vk < vfKeys.length; vk++) row[vfKeys[vk]] = vf[vfKeys[vk]];
        row.work_date = vte.work_date; row.hours_regular = vte.hours_regular;
        row.hours_overtime = vte.hours_overtime; row.hours_double = vte.hours_double;
        row.entry_status = vte.status; row.source = vte.source;
        row.first_name = vemp.first_name; row.last_name = vemp.last_name;
        row.employee_number = vemp.employee_number;
        row.cost_code_value = vcc.code || null; row.job_number = vcc.job_number || null;
        vrows.push(row);
      }
      return send(vrows);
    }

    // RUN VALIDATION
    if (p === '/api/validation/run' && m === 'POST') {
      var vflags = [];
      for (var vi2 = 0; vi2 < DATA.time_entries.length; vi2++) {
        var vte2 = DATA.time_entries[vi2];
        if (vte2.status === 'rejected' || vte2.status === 'clocked_in') continue;
        var vtotal = Number(vte2.hours_regular) + Number(vte2.hours_overtime) + Number(vte2.hours_double);
        if (vtotal >= 16) {
          var vemp2 = null;
          for (var ve = 0; ve < DATA.employees.length; ve++) { if (DATA.employees[ve].id === vte2.employee_id) { vemp2 = DATA.employees[ve]; break; } }
          vemp2 = vemp2 || {};
          vflags.push({ time_entry_id: vte2.id, flag_type: 'excessive_hours',
            flag_message: (vemp2.first_name||'') + ' ' + (vemp2.last_name||'') + ' logged ' + vtotal + 'h — exceeds 16h threshold' });
        }
        if (!vte2.cost_code_id) {
          var vemp3 = null;
          for (var ve2 = 0; ve2 < DATA.employees.length; ve2++) { if (DATA.employees[ve2].id === vte2.employee_id) { vemp3 = DATA.employees[ve2]; break; } }
          vemp3 = vemp3 || {};
          vflags.push({ time_entry_id: vte2.id, flag_type: 'missing_cost_code',
            flag_message: (vemp3.first_name||'') + ' ' + (vemp3.last_name||'') + ' — no cost code assigned' });
        }
      }
      var flagIns = 0;
      for (var fi = 0; fi < vflags.length; fi++) {
        var vf2 = vflags[fi];
        var exists = false;
        for (var ex = 0; ex < DATA.validation_flags.length; ex++) {
          if (DATA.validation_flags[ex].time_entry_id === vf2.time_entry_id && DATA.validation_flags[ex].flag_type === vf2.flag_type && !DATA.validation_flags[ex].is_resolved) { exists = true; break; }
        }
        if (exists) continue;
        DATA.validation_flags.push({ id: nextFlagId++, time_entry_id: vf2.time_entry_id, flag_type: vf2.flag_type,
          flag_message: vf2.flag_message, is_resolved: false, resolved_by: null, resolved_at: null,
          created_at: new Date().toISOString() });
        flagIns++;
      }
      return send({ scanned: DATA.time_entries.length, new_flags: flagIns });
    }

    // RESOLVE FLAG
    var fMatch = p.match(/^\/api\/validation\/flags\/(\d+)\/resolve$/);
    if (fMatch && m === 'PUT') {
      var fId = parseInt(fMatch[1]);
      return parseBody().then(function(body) {
        var flag = null;
        for (var i = 0; i < DATA.validation_flags.length; i++) { if (DATA.validation_flags[i].id === fId) { flag = DATA.validation_flags[i]; break; } }
        if (!flag) return send({ error: 'Not found' }, 404);
        flag.is_resolved = true;
        flag.resolved_by = body.resolved_by || 10;
        flag.resolved_at = new Date().toISOString();
        return send(flag);
      });
    }

    // EXPORT PREVIEW
    if (p === '/api/export/sage300/preview' && m === 'GET') {
      if (!q.start_date || !q.end_date) return send({ error: 'start_date and end_date required' }, 400);
      var exEntries = [];
      for (var ei = 0; ei < DATA.time_entries.length; ei++) {
        var ete = DATA.time_entries[ei];
        if (ete.status !== 'approved' || ete.work_date < q.start_date || ete.work_date > q.end_date) continue;
        var eemp = null; var ecc = null;
        for (var e1 = 0; e1 < DATA.employees.length; e1++) { if (DATA.employees[e1].id === ete.employee_id) { eemp = DATA.employees[e1]; break; } }
        if (ete.cost_code_id) { for (var e2 = 0; e2 < DATA.cost_codes.length; e2++) { if (DATA.cost_codes[e2].id === ete.cost_code_id) { ecc = DATA.cost_codes[e2]; break; } } }
        eemp = eemp || {}; ecc = ecc || {};
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
        for (var hii = 0; hii < hdr.length; hii++) obj[hdr[hii]] = vals[hii] || '';
        pRows.push(obj);
      }
      return send({ filename: 'PAYROLL_' + q.start_date.replace(/-/g, '') + '_' + q.end_date.replace(/-/g, '') + '.PRT', row_count: pRows.length, rows: pRows });
    }

    // EXPORT DOWNLOAD
    if (p === '/api/export/sage300' && m === 'GET') {
      if (!q.start_date || !q.end_date) return send({ error: 'dates required' }, 400);
      var dlEntries = [];
      for (var dli = 0; dli < DATA.time_entries.length; dli++) {
        var dte = DATA.time_entries[dli];
        if (dte.status !== 'approved' || dte.work_date < q.start_date || dte.work_date > q.end_date) continue;
        var demp = null; var dcc = null;
        for (var d1 = 0; d1 < DATA.employees.length; d1++) { if (DATA.employees[d1].id === dte.employee_id) { demp = DATA.employees[d1]; break; } }
        if (dte.cost_code_id) { for (var d2 = 0; d2 < DATA.cost_codes.length; d2++) { if (DATA.cost_codes[d2].id === dte.cost_code_id) { dcc = DATA.cost_codes[d2]; break; } } }
        demp = demp || {}; dcc = dcc || {};
        dlEntries.push({ employee_number: demp.employee_number, work_date: dte.work_date, job_number: dcc.job_number,
          cost_code: dcc.code, category: dcc.category, hourly_rate: demp.hourly_rate,
          hours_regular: dte.hours_regular, hours_overtime: dte.hours_overtime, hours_double: dte.hours_double,
          per_diem: dte.per_diem, per_diem_location: dte.per_diem_location, notes: dte.notes });
      }
      var dlPrt = makePRT(dlEntries);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="PAYROLL_' + q.start_date.replace(/-/g, '') + '_' + q.end_date.replace(/-/g, '') + '.PRT"');
      res.end(dlPrt);
      return;
    }

    // AUDIT LOGS
    if (p === '/api/audit-logs' && m === 'GET') {
      var aRows = [];
      for (var ali = 0; ali < DATA.audit_logs.length; ali++) {
        var al = DATA.audit_logs[ali];
        var aemp = null;
        for (var aei = 0; aei < DATA.employees.length; aei++) { if (DATA.employees[aei].id === al.changed_by) { aemp = DATA.employees[aei]; break; } }
        var arow = {};
        var alKeys = Object.keys(al);
        for (var ak = 0; ak < alKeys.length; ak++) arow[alKeys[ak]] = al[alKeys[ak]];
        arow.first_name = aemp ? aemp.first_name : null;
        arow.last_name = aemp ? aemp.last_name : null;
        aRows.push(arow);
      }
      aRows.sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); });
      return send(aRows.slice(0, 100));
    }

    if (p === '/api/upload/proof-photo' && m === 'POST') {
      return send({ url: '/uploads/proof-photos/demo_proof.jpg' });
    }

    return send({ error: 'Not found', path: p, method: m }, 404);

  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({ error: String(err.message || err), stack: String(err.stack || '') }));
  }
};
