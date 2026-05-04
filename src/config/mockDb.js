// In-memory mock database for demo mode (no PostgreSQL required)
const seedEmployees = [
  { id:1, employee_number:'EMP001',first_name:'Carlos',last_name:'Martinez',role:'foreman',crew_id:1,hourly_rate:42.50,home_state:'TX',is_active:true,hire_date:'2019-03-15' },
  { id:2, employee_number:'EMP002',first_name:'James',last_name:'Wilson',role:'worker',crew_id:1,hourly_rate:35.00,home_state:'TX',is_active:true,hire_date:'2020-06-01' },
  { id:3, employee_number:'EMP003',first_name:'Maria',last_name:'Garcia',role:'worker',crew_id:1,hourly_rate:35.00,home_state:'TX',is_active:true,hire_date:'2020-08-20' },
  { id:4, employee_number:'EMP004',first_name:'Robert',last_name:'Johnson',role:'worker',crew_id:1,hourly_rate:34.00,home_state:'TX',is_active:true,hire_date:'2021-01-10' },
  { id:5, employee_number:'EMP005',first_name:'David',last_name:'Brown',role:'worker',crew_id:1,hourly_rate:33.50,home_state:'TX',is_active:true,hire_date:'2021-04-05' },
  { id:6, employee_number:'EMP006',first_name:'Sarah',last_name:'Davis',role:'foreman',crew_id:2,hourly_rate:43.00,home_state:'TX',is_active:true,hire_date:'2018-11-20' },
  { id:7, employee_number:'EMP007',first_name:'Michael',last_name:'Thompson',role:'worker',crew_id:2,hourly_rate:36.00,home_state:'NM',is_active:true,hire_date:'2020-02-14' },
  { id:8, employee_number:'EMP008',first_name:'Jennifer',last_name:'Anderson',role:'worker',crew_id:2,hourly_rate:34.50,home_state:'NM',is_active:true,hire_date:'2021-06-30' },
  { id:9, employee_number:'EMP009',first_name:'William',last_name:'Taylor',role:'worker',crew_id:2,hourly_rate:35.50,home_state:'TX',is_active:true,hire_date:'2020-09-12' },
  { id:10, employee_number:'EMP010',first_name:'Linda',last_name:'Thomas',role:'supervisor',crew_id:null,hourly_rate:55.00,home_state:'TX',is_active:true,hire_date:'2017-05-01' },
  { id:11, employee_number:'EMP011',first_name:'Richard',last_name:'Jackson',role:'worker',crew_id:1,hourly_rate:33.00,home_state:'TX',is_active:true,hire_date:'2022-01-15' },
  { id:12, employee_number:'EMP012',first_name:'Patricia',last_name:'White',role:'worker',crew_id:1,hourly_rate:34.00,home_state:'TX',is_active:true,hire_date:'2021-09-01' },
  { id:13, employee_number:'EMP013',first_name:'Jose',last_name:'Hernandez',role:'worker',crew_id:2,hourly_rate:35.00,home_state:'NM',is_active:true,hire_date:'2020-11-10' },
  { id:14, employee_number:'EMP014',first_name:'Daniel',last_name:'Moore',role:'worker',crew_id:2,hourly_rate:33.50,home_state:'TX',is_active:true,hire_date:'2022-03-20' },
  { id:15, employee_number:'EMP015',first_name:'Karen',last_name:'Clark',role:'admin',crew_id:null,hourly_rate:48.00,home_state:'TX',is_active:true,hire_date:'2018-01-10' },
];

const seedCostCodes = [
  { id:1, code:'0100-210',description:'Concrete Foundations',job_number:'JOB-2026-001',phase:'Phase 1',category:'Labor',is_active:true },
  { id:2, code:'0100-310',description:'Steel Erection',job_number:'JOB-2026-001',phase:'Phase 2',category:'Labor',is_active:true },
  { id:3, code:'0100-410',description:'Electrical Rough-in',job_number:'JOB-2026-001',phase:'Phase 2',category:'Labor',is_active:true },
  { id:4, code:'0200-110',description:'Site Grading',job_number:'JOB-2026-002',phase:'Phase 1',category:'Equipment',is_active:true },
  { id:5, code:'0200-210',description:'Underground Utilities',job_number:'JOB-2026-002',phase:'Phase 1',category:'Labor',is_active:true },
  { id:6, code:'0300-110',description:'Interior Framing',job_number:'JOB-2026-003',phase:'Phase 3',category:'Labor',is_active:true },
  { id:7, code:'0300-210',description:'Drywall & Finish',job_number:'JOB-2026-003',phase:'Phase 3',category:'Labor',is_active:true },
  { id:8, code:'9000-100',description:'General Conditions',job_number:'JOB-2026-001',phase:'Overhead',category:'Overhead',is_active:true },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const seedTimeEntries = [
  { id:1,employee_id:1,cost_code_id:1,work_date:yesterday,clock_in:null,clock_out:null,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'pending',foreman_id:1,proof_photo_url:null,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:null,approved_at:null,created_at:yesterday,updated_at:yesterday },
  { id:2,employee_id:2,cost_code_id:1,work_date:yesterday,clock_in:null,clock_out:null,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'pending',foreman_id:1,proof_photo_url:null,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:null,approved_at:null,created_at:yesterday,updated_at:yesterday },
  { id:3,employee_id:3,cost_code_id:1,work_date:yesterday,clock_in:null,clock_out:null,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'approved',foreman_id:1,proof_photo_url:null,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:10,approved_at:yesterday,created_at:yesterday,updated_at:yesterday },
  { id:4,employee_id:4,cost_code_id:2,work_date:yesterday,clock_in:null,clock_out:null,hours_regular:8,hours_overtime:2,hours_double:0,per_diem:0,per_diem_location:null,source:'huddle',status:'approved',foreman_id:1,proof_photo_url:null,notes:null,reason_code:null,reason_note:null,created_by:1,approved_by:10,approved_at:yesterday,created_at:yesterday,updated_at:yesterday },
  { id:5,employee_id:7,cost_code_id:3,work_date:today,clock_in:null,clock_out:null,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:232,per_diem_location:'ABQ',source:'huddle',status:'pending',foreman_id:6,proof_photo_url:null,notes:null,reason_code:null,reason_note:null,created_by:6,approved_by:null,approved_at:null,created_at:today,updated_at:today },
  { id:6,employee_id:8,cost_code_id:3,work_date:today,clock_in:null,clock_out:null,hours_regular:8,hours_overtime:0,hours_double:0,per_diem:232,per_diem_location:'ABQ',source:'huddle',status:'pending',foreman_id:6,proof_photo_url:null,notes:null,reason_code:null,reason_note:null,created_by:6,approved_by:null,approved_at:null,created_at:today,updated_at:today },
  { id:7,employee_id:11,cost_code_id:1,work_date:today,clock_in:null,clock_out:null,hours_regular:8,hours_overtime:4,hours_double:6,per_diem:0,per_diem_location:null,source:'manual',status:'pending',foreman_id:null,proof_photo_url:null,notes:'Flaggable: 18h day',reason_code:'supervisor_override',reason_note:null,created_by:10,approved_by:null,approved_at:null,created_at:today,updated_at:today },
];

let nextEntryId = seedTimeEntries.length + 1;
let nextAuditId = 1;
let nextFlagId = 1;

const data = {
  employees: [...seedEmployees],
  cost_codes: [...seedCostCodes],
  time_entries: [...seedTimeEntries],
  audit_logs: [],
  validation_flags: [],
};

function matchFilter(row, key, val) {
  if (val === undefined || val === null || val === '') return true;
  const rv = String(row[key]);
  const fv = String(val);
  if (fv === 'true') return row[key] === true;
  if (fv === 'false') return row[key] === false;
  return rv === fv;
}

const mockDb = {
  query: async (sql, params = []) => {
    const sqlLower = sql.toLowerCase().trim();

    // ── SELECT from employees ──
    if (sqlLower.includes('from employees') && sqlLower.startsWith('select')) {
      let rows = [...data.employees];
      if (params.length > 0 && sqlLower.includes('where')) {
        // Simple param-based filtering
        if (sqlLower.includes('crew_id')) rows = rows.filter(r => r.crew_id == params[0]);
        if (sqlLower.includes('is_active')) rows = rows.filter(r => r.is_active === (params[0] === true || params[0] === 'true'));
        if (sqlLower.includes('where id =') || sqlLower.includes('where "id" =')) {
          const idParam = params[params.length - 1];
          rows = rows.filter(r => r.id == idParam);
        }
      }
      rows.sort((a,b) => a.last_name.localeCompare(b.last_name));
      return { rows, rowCount: rows.length };
    }

    // ── UPDATE employees ──
    if (sqlLower.startsWith('update employees')) {
      const id = params[params.length - 1];
      const emp = data.employees.find(e => e.id == id);
      if (!emp) return { rows: [], rowCount: 0 };
      Object.assign(emp, {
        first_name: params[0] || emp.first_name,
        last_name: params[1] || emp.last_name,
        updated_at: new Date().toISOString(),
      });
      return { rows: [emp], rowCount: 1 };
    }

    // ── SELECT from cost_codes ──
    if (sqlLower.includes('from cost_codes') && sqlLower.startsWith('select')) {
      let rows = [...data.cost_codes].filter(c => c.is_active);
      rows.sort((a,b) => a.code.localeCompare(b.code));
      return { rows, rowCount: rows.length };
    }

    // ── SELECT from time_entries ──
    if (sqlLower.includes('from time_entries') && sqlLower.startsWith('select') && !sqlLower.includes('validation_flags')) {
      let rows = data.time_entries.map(te => {
        const emp = data.employees.find(e => e.id === te.employee_id) || {};
        const cc = data.cost_codes.find(c => c.id === te.cost_code_id) || {};
        return { ...te, first_name: emp.first_name, last_name: emp.last_name, employee_number: emp.employee_number, cost_code_value: cc.code, cost_code_desc: cc.description, job_number: cc.job_number, category: cc.category, hourly_rate: emp.hourly_rate };
      });

      // Apply filters from params
      for (let i = 0; i < params.length; i++) {
        const p = params[i];
        if (typeof p === 'string' && ['pending','approved','flagged','rejected'].includes(p)) {
          rows = rows.filter(r => r.status === p);
        }
        if (typeof p === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p)) {
          rows = rows.filter(r => r.work_date === p);
        }
      }

      rows.sort((a,b) => (b.work_date || '').localeCompare(a.work_date || ''));
      return { rows, rowCount: rows.length };
    }

    // ── INSERT into time_entries (single) ──
    if (sqlLower.startsWith('insert into time_entries') && !sqlLower.includes('huddle')) {
      const entry = {
        id: nextEntryId++,
        employee_id: params[0], cost_code_id: params[1], work_date: params[2],
        clock_in: params[3], clock_out: params[4],
        hours_regular: params[5], hours_overtime: params[6], hours_double: params[7],
        per_diem: params[8], per_diem_location: params[9],
        source: params[10], foreman_id: params[11], proof_photo_url: params[12],
        notes: params[13], reason_code: params[14], reason_note: params[15],
        created_by: params[16], status: 'pending',
        approved_by: null, approved_at: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      data.time_entries.push(entry);
      return { rows: [entry], rowCount: 1 };
    }

    // ── INSERT into time_entries (huddle) ──
    if (sqlLower.startsWith('insert into time_entries') && sqlLower.includes('huddle')) {
      const entry = {
        id: nextEntryId++,
        employee_id: params[0], cost_code_id: params[1], work_date: params[2],
        clock_in: null, clock_out: null,
        hours_regular: params[3], hours_overtime: params[4], hours_double: params[5],
        per_diem: params[6], per_diem_location: params[7],
        source: 'huddle', foreman_id: params[8], proof_photo_url: params[9],
        notes: params[10], reason_code: null, reason_note: null,
        created_by: params[11], status: 'pending',
        approved_by: null, approved_at: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      const dup = data.time_entries.find(t =>
        t.employee_id == entry.employee_id && t.work_date === entry.work_date
        && t.cost_code_id == entry.cost_code_id && t.status !== 'rejected'
      );
      if (dup) return { rows: [], rowCount: 0 };
      data.time_entries.push(entry);
      return { rows: [entry], rowCount: 1 };
    }

    // ── UPDATE time_entries ──
    if (sqlLower.startsWith('update time_entries')) {
      if (sqlLower.includes("status = 'rejected'")) {
        const id = params[0];
        const te = data.time_entries.find(e => e.id == id);
        if (!te) return { rows: [], rowCount: 0 };
        te.status = 'rejected';
        te.updated_at = new Date().toISOString();
        return { rows: [te], rowCount: 1 };
      }
      const id = params[params.length - 1];
      const te = data.time_entries.find(e => e.id == id);
      if (!te) return { rows: [], rowCount: 0 };
      if (params[0] != null) te.cost_code_id = params[0];
      if (params[10]) te.status = params[10];
      if (params[11]) te.reason_code = params[11];
      if (params[12]) te.reason_note = params[12];
      if (params[10] === 'approved') te.approved_at = new Date().toISOString();
      te.updated_at = new Date().toISOString();
      return { rows: [te], rowCount: 1 };
    }

    // ── SELECT from audit_logs ──
    if (sqlLower.includes('from audit_logs')) {
      let rows = [...data.audit_logs];
      if (params.length > 0 && sqlLower.includes('table_name')) {
        rows = rows.filter(r => r.table_name === params[0]);
      }
      rows = rows.map(al => {
        const emp = data.employees.find(e => e.id === al.changed_by);
        return { ...al, first_name: emp?.first_name, last_name: emp?.last_name };
      });
      rows.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      return { rows: rows.slice(0, 100), rowCount: rows.length };
    }

    // ── INSERT into audit_logs ──
    if (sqlLower.startsWith('insert into audit_logs')) {
      const log = {
        id: nextAuditId++,
        table_name: params[0], record_id: params[1], action: params[2],
        before_state: params[3] ? JSON.parse(params[3]) : null,
        after_state: params[4] ? JSON.parse(params[4]) : null,
        changed_by: params[5], change_reason: params[6], change_note: params[7],
        ip_address: params[8], user_agent: params[9],
        created_at: new Date().toISOString(),
      };
      data.audit_logs.push(log);
      return { rows: [log], rowCount: 1 };
    }

    // ── SELECT from validation_flags ──
    if (sqlLower.includes('from validation_flags') && sqlLower.startsWith('select')) {
      let rows = data.validation_flags.filter(f => !f.is_resolved);
      rows = rows.map(vf => {
        const te = data.time_entries.find(t => t.id === vf.time_entry_id) || {};
        const emp = data.employees.find(e => e.id === te.employee_id) || {};
        const cc = data.cost_codes.find(c => c.id === te.cost_code_id) || {};
        return {
          ...vf,
          work_date: te.work_date, hours_regular: te.hours_regular,
          hours_overtime: te.hours_overtime, hours_double: te.hours_double,
          entry_status: te.status, source: te.source,
          first_name: emp.first_name, last_name: emp.last_name,
          employee_number: emp.employee_number,
          cost_code_value: cc.code, job_number: cc.job_number,
        };
      });
      return { rows, rowCount: rows.length };
    }

    // ── Validation scan queries (excessive hours) ──
    if (sqlLower.includes('hours_regular') && sqlLower.includes('>= 16')) {
      const rows = data.time_entries
        .filter(te => te.status !== 'rejected' && (Number(te.hours_regular) + Number(te.hours_overtime) + Number(te.hours_double)) >= 16)
        .map(te => {
          const emp = data.employees.find(e => e.id === te.employee_id) || {};
          return { id: te.id, first_name: emp.first_name, last_name: emp.last_name, total_hours: Number(te.hours_regular) + Number(te.hours_overtime) + Number(te.hours_double) };
        });
      return { rows, rowCount: rows.length };
    }

    // ── Validation scan: missing cost codes ──
    if (sqlLower.includes('cc.is_active = false')) {
      return { rows: [], rowCount: 0 };
    }

    // ── Validation scan: duplicates ──
    if (sqlLower.includes('having count(*)')) {
      return { rows: [], rowCount: 0 };
    }

    // ── Validation scan: missing punches ──
    if (sqlLower.includes('clock_in is null')) {
      return { rows: [], rowCount: 0 };
    }

    // ── INSERT into validation_flags ──
    if (sqlLower.startsWith('insert into validation_flags')) {
      const existing = data.validation_flags.find(f =>
        f.time_entry_id == params[0] && f.flag_type === params[1] && !f.is_resolved
      );
      if (existing) return { rows: [], rowCount: 0 };
      const flag = {
        id: nextFlagId++,
        time_entry_id: params[0], flag_type: params[1], flag_message: params[2],
        is_resolved: false, resolved_by: null, resolved_at: null,
        created_at: new Date().toISOString(),
      };
      data.validation_flags.push(flag);
      return { rows: [flag], rowCount: 1 };
    }

    // ── UPDATE validation_flags ──
    if (sqlLower.startsWith('update validation_flags')) {
      const id = params[1];
      const flag = data.validation_flags.find(f => f.id == id);
      if (!flag) return { rows: [], rowCount: 0 };
      flag.is_resolved = true;
      flag.resolved_by = params[0];
      flag.resolved_at = new Date().toISOString();
      return { rows: [flag], rowCount: 1 };
    }

    // ── SELECT * from (table) WHERE pk = id (audit middleware) ──
    if (sqlLower.includes('select * from')) {
      const tableMatch = sqlLower.match(/from\s+(\w+)/);
      if (tableMatch) {
        const tableName = tableMatch[1];
        if (data[tableName]) {
          const id = params[0];
          const row = data[tableName].find(r => r.id == id);
          return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
        }
      }
    }

    return { rows: [], rowCount: 0 };
  },
};

module.exports = mockDb;
