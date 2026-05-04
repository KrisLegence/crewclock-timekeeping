-- =============================================================
-- Timekeeping System – Core Schema
-- SOX-compliant with full audit trail
-- =============================================================

-- ENUM types
CREATE TYPE employee_role AS ENUM ('worker', 'foreman', 'supervisor', 'admin');
CREATE TYPE entry_source  AS ENUM ('huddle', 'kiosk', 'manual', 'mobile');
CREATE TYPE entry_status  AS ENUM ('pending', 'approved', 'flagged', 'rejected');
CREATE TYPE reason_code   AS ENUM (
  'forgot_to_punch',
  'wrong_cost_code',
  'equipment_failure',
  'supervisor_override',
  'schedule_change',
  'other'
);

-- ─── Employees ───────────────────────────────────────────────
CREATE TABLE employees (
  id              SERIAL PRIMARY KEY,
  employee_number VARCHAR(20)   UNIQUE NOT NULL,
  first_name      VARCHAR(100)  NOT NULL,
  last_name       VARCHAR(100)  NOT NULL,
  role            employee_role NOT NULL DEFAULT 'worker',
  crew_id         INTEGER,
  hourly_rate     NUMERIC(10,2) NOT NULL,
  home_state      VARCHAR(2)    NOT NULL DEFAULT 'TX',
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  hire_date       DATE          NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employees_crew    ON employees(crew_id);
CREATE INDEX idx_employees_active  ON employees(is_active);

-- ─── Cost Codes ──────────────────────────────────────────────
CREATE TABLE cost_codes (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(20)  UNIQUE NOT NULL,
  description VARCHAR(255) NOT NULL,
  job_number  VARCHAR(20)  NOT NULL,
  phase       VARCHAR(20),
  category    VARCHAR(50),
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cost_codes_job ON cost_codes(job_number);

-- ─── Time Entries ────────────────────────────────────────────
CREATE TABLE time_entries (
  id              SERIAL PRIMARY KEY,
  employee_id     INTEGER       NOT NULL REFERENCES employees(id),
  cost_code_id    INTEGER       NOT NULL REFERENCES cost_codes(id),
  work_date       DATE          NOT NULL,
  clock_in        TIMESTAMPTZ,
  clock_out       TIMESTAMPTZ,
  hours_regular   NUMERIC(5,2)  NOT NULL DEFAULT 0,
  hours_overtime  NUMERIC(5,2)  NOT NULL DEFAULT 0,
  hours_double    NUMERIC(5,2)  NOT NULL DEFAULT 0,
  per_diem        NUMERIC(8,2)  NOT NULL DEFAULT 0,
  per_diem_location VARCHAR(50),
  source          entry_source  NOT NULL DEFAULT 'manual',
  status          entry_status  NOT NULL DEFAULT 'pending',
  foreman_id      INTEGER       REFERENCES employees(id),
  proof_photo_url VARCHAR(500),
  notes           TEXT,
  reason_code     reason_code,
  reason_note     TEXT,
  created_by      INTEGER       NOT NULL REFERENCES employees(id),
  approved_by     INTEGER       REFERENCES employees(id),
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_time_entries_employee  ON time_entries(employee_id);
CREATE INDEX idx_time_entries_date      ON time_entries(work_date);
CREATE INDEX idx_time_entries_status    ON time_entries(status);
CREATE INDEX idx_time_entries_cost_code ON time_entries(cost_code_id);

-- Prevent duplicate punches for same employee+date+cost_code
CREATE UNIQUE INDEX idx_time_entries_no_dup
  ON time_entries(employee_id, work_date, cost_code_id)
  WHERE status != 'rejected';

-- ─── Audit Logs (SOX Compliance) ─────────────────────────────
CREATE TABLE audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  table_name    VARCHAR(100)  NOT NULL,
  record_id     INTEGER       NOT NULL,
  action        VARCHAR(10)   NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  before_state  JSONB,
  after_state   JSONB,
  changed_by    INTEGER       NOT NULL REFERENCES employees(id),
  change_reason reason_code,
  change_note   TEXT,
  ip_address    VARCHAR(45),
  user_agent    TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table   ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user    ON audit_logs(changed_by);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ─── Validation Flags ────────────────────────────────────────
CREATE TABLE validation_flags (
  id            SERIAL PRIMARY KEY,
  time_entry_id INTEGER      NOT NULL REFERENCES time_entries(id),
  flag_type     VARCHAR(50)  NOT NULL,
  flag_message  VARCHAR(500) NOT NULL,
  is_resolved   BOOLEAN      NOT NULL DEFAULT FALSE,
  resolved_by   INTEGER      REFERENCES employees(id),
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_validation_flags_entry    ON validation_flags(time_entry_id);
CREATE INDEX idx_validation_flags_resolved ON validation_flags(is_resolved);
