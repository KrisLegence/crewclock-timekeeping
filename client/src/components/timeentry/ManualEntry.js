import React, { useState, useEffect } from 'react';

const REASON_CODES = [
  { value: '', label: 'Select reason...' },
  { value: 'forgot_to_punch', label: 'Forgot to punch in/out' },
  { value: 'wrong_cost_code', label: 'Wrong cost code correction' },
  { value: 'equipment_failure', label: 'Equipment failure (kiosk down)' },
  { value: 'supervisor_override', label: 'Supervisor override' },
  { value: 'schedule_change', label: 'Schedule change' },
  { value: 'other', label: 'Other (must explain)' },
];

const LOCATIONS = [
  { value: '', label: 'No Per Diem' },
  { value: 'TX', label: 'Texas (Local) — $69' },
  { value: 'TX_TRAVEL', label: 'Texas (Travel) — $235' },
  { value: 'ABQ', label: 'Albuquerque, NM — $232' },
  { value: 'DEFAULT', label: 'Standard GSA — $166' },
];

export default function ManualEntry() {
  const [employees, setEmployees] = useState([]);
  const [costCodes, setCostCodes] = useState([]);
  const [toast, setToast] = useState('');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    employee_id: '',
    cost_code_id: '',
    work_date: new Date().toISOString().split('T')[0],
    total_hours: '8',
    per_diem_location: '',
    notes: '',
    reason_code: '',
    reason_note: '',
  });

  useEffect(() => {
    fetch('/api/employees?active=true').then(r => r.json()).then(setEmployees).catch(() => {});
    fetch('/api/cost-codes?active=true').then(r => r.json()).then(setCostCodes).catch(() => {});
  }, []);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.employee_id) e.employee_id = 'Employee is required';
    if (!form.cost_code_id) e.cost_code_id = 'Cost code is required';
    if (!form.work_date) e.work_date = 'Date is required';
    if (!form.total_hours || parseFloat(form.total_hours) <= 0) e.total_hours = 'Valid hours required';
    if (!form.reason_code) e.reason_code = 'Reason code is REQUIRED for manual entries';
    if (form.reason_code === 'other' && (!form.reason_note || form.reason_note.trim().length < 5)) {
      e.reason_note = 'Explanation required (min 5 characters) when reason is "Other"';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await fetch('/api/time-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        employee_id: parseInt(form.employee_id),
        cost_code_id: parseInt(form.cost_code_id),
        total_hours: parseFloat(form.total_hours),
        per_diem_location: form.per_diem_location || null,
        source: 'manual',
        created_by: 15,
      }),
    });

    if (res.ok) {
      setToast('Entry saved successfully');
      setTimeout(() => setToast(''), 3000);
      setForm({ ...form, employee_id: '', notes: '', reason_code: '', reason_note: '' });
    } else {
      const err = await res.json();
      setToast(`Error: ${err.error}`);
      setTimeout(() => setToast(''), 4000);
    }
  };

  const FieldError = ({ field }) => errors[field]
    ? <div style={{ color: 'var(--red-500)', fontSize: 12, marginTop: 4 }}>{errors[field]}</div>
    : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Manual Time Entry</h1>
          <div className="subtitle">Admin entry — reason code required for SOX compliance.</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2>Entry Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Employee *</label>
              <select value={form.employee_id} onChange={e => update('employee_id', e.target.value)}
                style={{ borderColor: errors.employee_id ? 'var(--red-500)' : undefined }}>
                <option value="">Select employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.last_name}, {emp.first_name} ({emp.employee_number})</option>
                ))}
              </select>
              <FieldError field="employee_id" />
            </div>
            <div className="form-group">
              <label>Cost Code *</label>
              <select value={form.cost_code_id} onChange={e => update('cost_code_id', e.target.value)}
                style={{ borderColor: errors.cost_code_id ? 'var(--red-500)' : undefined }}>
                <option value="">Select cost code...</option>
                {costCodes.map(cc => (
                  <option key={cc.id} value={cc.id}>{cc.code} — {cc.description}</option>
                ))}
              </select>
              <FieldError field="cost_code_id" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Work Date *</label>
              <input type="date" value={form.work_date} onChange={e => update('work_date', e.target.value)}
                style={{ borderColor: errors.work_date ? 'var(--red-500)' : undefined }} />
              <FieldError field="work_date" />
            </div>
            <div className="form-group">
              <label>Total Hours *</label>
              <input type="number" value={form.total_hours} min="0" max="24" step="0.5"
                onChange={e => update('total_hours', e.target.value)}
                style={{ borderColor: errors.total_hours ? 'var(--red-500)' : undefined }} />
              <FieldError field="total_hours" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Per Diem Location</label>
              <select value={form.per_diem_location} onChange={e => update('per_diem_location', e.target.value)}>
                {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Optional notes..." />
            </div>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--amber-500)' }}>
          <h2 style={{ color: 'var(--amber-500)' }}>⚠ Reason for Manual Entry (Required)</h2>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
            SOX compliance requires a documented reason for any manually created or modified time entry.
          </p>
          <div className="form-group">
            <label>Reason Code *</label>
            <select value={form.reason_code} onChange={e => update('reason_code', e.target.value)}
              style={{ borderColor: errors.reason_code ? 'var(--red-500)' : undefined }}>
              {REASON_CODES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <FieldError field="reason_code" />
          </div>
          {form.reason_code === 'other' && (
            <div className="form-group">
              <label>Explanation *</label>
              <textarea rows="3" value={form.reason_note} onChange={e => update('reason_note', e.target.value)}
                placeholder="Explain why this manual entry is needed..."
                style={{ borderColor: errors.reason_note ? 'var(--red-500)' : undefined }} />
              <FieldError field="reason_note" />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" className="btn btn-outline" onClick={() => setForm({
            employee_id: '', cost_code_id: '', work_date: new Date().toISOString().split('T')[0],
            total_hours: '8', per_diem_location: '', notes: '', reason_code: '', reason_note: '',
          })}>Clear</button>
          <button type="submit" className="btn btn-primary">Save Entry</button>
        </div>
      </form>

      {toast && <div className="toast" style={{ background: toast.startsWith('Error') ? 'var(--red-500)' : 'var(--green-600)' }}>{toast}</div>}
    </div>
  );
}
