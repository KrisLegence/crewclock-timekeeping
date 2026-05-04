require('dotenv').config();
const db = require('../config/db');

const employees = [
  ['EMP001','Carlos','Martinez','foreman',1,42.50,'TX','2019-03-15'],
  ['EMP002','James','Wilson','worker',1,35.00,'TX','2020-06-01'],
  ['EMP003','Maria','Garcia','worker',1,35.00,'TX','2020-08-20'],
  ['EMP004','Robert','Johnson','worker',1,34.00,'TX','2021-01-10'],
  ['EMP005','David','Brown','worker',1,33.50,'TX','2021-04-05'],
  ['EMP006','Sarah','Davis','foreman',2,43.00,'TX','2018-11-20'],
  ['EMP007','Michael','Thompson','worker',2,36.00,'NM','2020-02-14'],
  ['EMP008','Jennifer','Anderson','worker',2,34.50,'NM','2021-06-30'],
  ['EMP009','William','Taylor','worker',2,35.50,'TX','2020-09-12'],
  ['EMP010','Linda','Thomas','supervisor',null,55.00,'TX','2017-05-01'],
  ['EMP011','Richard','Jackson','worker',1,33.00,'TX','2022-01-15'],
  ['EMP012','Patricia','White','worker',1,34.00,'TX','2021-09-01'],
  ['EMP013','Jose','Hernandez','worker',2,35.00,'NM','2020-11-10'],
  ['EMP014','Daniel','Moore','worker',2,33.50,'TX','2022-03-20'],
  ['EMP015','Karen','Clark','admin',null,48.00,'TX','2018-01-10'],
];

const costCodes = [
  ['0100-210','Concrete Foundations','JOB-2026-001','Phase 1','Labor'],
  ['0100-310','Steel Erection','JOB-2026-001','Phase 2','Labor'],
  ['0100-410','Electrical Rough-in','JOB-2026-001','Phase 2','Labor'],
  ['0200-110','Site Grading','JOB-2026-002','Phase 1','Equipment'],
  ['0200-210','Underground Utilities','JOB-2026-002','Phase 1','Labor'],
  ['0300-110','Interior Framing','JOB-2026-003','Phase 3','Labor'],
  ['0300-210','Drywall & Finish','JOB-2026-003','Phase 3','Labor'],
  ['9000-100','General Conditions','JOB-2026-001','Overhead','Overhead'],
];

async function seed() {
  for (const e of employees) {
    await db.query(
      `INSERT INTO employees (employee_number, first_name, last_name, role, crew_id, hourly_rate, home_state, hire_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (employee_number) DO NOTHING`,
      e
    );
  }
  console.log(`Seeded ${employees.length} employees`);

  for (const c of costCodes) {
    await db.query(
      `INSERT INTO cost_codes (code, description, job_number, phase, category)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (code) DO NOTHING`,
      c
    );
  }
  console.log(`Seeded ${costCodes.length} cost codes`);

  // Seed some time entries for demo
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const entries = [
    [1,1,yesterday,8,0,0,0,null,'huddle',1,null],
    [2,1,yesterday,8,0,0,0,null,'huddle',1,null],
    [3,1,yesterday,8,0,0,0,null,'huddle',1,null],
    [4,2,yesterday,8,2,0,0,null,'huddle',1,null],
    [5,2,yesterday,8,0,0,0,null,'huddle',1,null],
    [7,3,today,8,0,0,74,'ABQ','huddle',6,null],
    [8,3,today,8,0,0,74,'ABQ','huddle',6,null],
    [9,4,today,10,2,0,0,null,'manual',6,'forgot_to_punch'],
    [11,1,today,18,0,0,0,null,'manual',10,'supervisor_override'],
  ];

  for (const e of entries) {
    await db.query(
      `INSERT INTO time_entries
        (employee_id, cost_code_id, work_date, hours_regular, hours_overtime, hours_double,
         per_diem, per_diem_location, source, created_by, reason_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT DO NOTHING`,
      e
    );
  }
  console.log(`Seeded ${entries.length} time entries`);

  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
