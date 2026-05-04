import React, { useState, useEffect, useRef } from 'react';

const LOCATIONS = [
  { value: '', label: 'No Per Diem' },
  { value: 'TX', label: 'Texas (Local) — $69' },
  { value: 'TX_TRAVEL', label: 'Texas (Travel) — $235' },
  { value: 'ABQ', label: 'Albuquerque, NM — $232' },
  { value: 'DEFAULT', label: 'Standard GSA — $166' },
];

export default function HuddleEntry() {
  const [employees, setEmployees] = useState([]);
  const [costCodes, setCostCodes] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [costCodeId, setCostCodeId] = useState('');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('8');
  const [perDiemLoc, setPerDiemLoc] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [step, setStep] = useState(1);
  const fileInput = useRef(null);

  useEffect(() => {
    fetch('/api/employees?active=true').then(r => r.json()).then(setEmployees).catch(() => {});
    fetch('/api/cost-codes?active=true').then(r => r.json()).then(setCostCodes).catch(() => {});
  }, []);

  const toggleEmployee = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllCrew = (crewId) => {
    const crewMembers = employees.filter(e => e.crew_id === crewId);
    setSelected(prev => {
      const next = new Set(prev);
      const allSelected = crewMembers.every(e => next.has(e.id));
      crewMembers.forEach(e => allSelected ? next.delete(e.id) : next.add(e.id));
      return next;
    });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (selected.size === 0 || !costCodeId) return;

    setSubmitting(true);
    try {
      let photoUrl = null;
      if (photo) {
        const fd = new FormData();
        fd.append('photo', photo);
        const res = await fetch('/api/upload/proof-photo', { method: 'POST', body: fd });
        const data = await res.json();
        photoUrl = data.url;
      }

      const res = await fetch('/api/time-entries/huddle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_ids: Array.from(selected),
          cost_code_id: parseInt(costCodeId),
          work_date: workDate,
          total_hours: parseFloat(hours),
          per_diem_location: perDiemLoc || null,
          foreman_id: 1,
          proof_photo_url: photoUrl,
          notes,
        }),
      });

      const result = await res.json();
      setToast(`${result.created} entries submitted successfully`);
      setTimeout(() => setToast(''), 3000);
      setSelected(new Set());
      setPhoto(null);
      setPhotoPreview(null);
      setStep(1);
    } catch (err) {
      setToast('Error submitting entries');
      setTimeout(() => setToast(''), 3000);
    }
    setSubmitting(false);
  };

  const crews = [...new Set(employees.map(e => e.crew_id).filter(Boolean))];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Crew Huddle Entry</h1>
          <div className="subtitle">Select your crew, assign a cost code, snap a proof photo.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
              background: step >= s ? 'var(--blue-600)' : 'var(--gray-200)',
              color: step >= s ? 'white' : 'var(--gray-500)',
            }}>{s}</div>
          ))}
        </div>
      </div>

      {/* STEP 1: Select Crew */}
      {step === 1 && (
        <div className="card">
          <h2>Step 1 — Select Crew Members ({selected.size} selected)</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {crews.map(c => (
              <button key={c} className="btn btn-outline btn-sm" onClick={() => selectAllCrew(c)}>
                Crew {c}: Select All
              </button>
            ))}
          </div>
          <div className="crew-grid">
            {employees.filter(e => e.role !== 'admin').map(emp => (
              <div
                key={emp.id}
                className={`crew-card ${selected.has(emp.id) ? 'selected' : ''}`}
                onClick={() => toggleEmployee(emp.id)}
              >
                <div className="checkmark">{selected.has(emp.id) ? '✓' : ''}</div>
                <div className="name">{emp.first_name} {emp.last_name}</div>
                <div className="emp-num">{emp.employee_number}</div>
                <div className="emp-num" style={{ marginTop: 2 }}>
                  {emp.role === 'foreman' ? 'Foreman' : `Crew ${emp.crew_id || '—'}`}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-primary" disabled={selected.size === 0} onClick={() => setStep(2)}>
              Next: Assign Work →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Assignment details */}
      {step === 2 && (
        <div className="card">
          <h2>Step 2 — Work Assignment for {selected.size} crew members</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Work Date</label>
              <input type="date" value={workDate} onChange={e => setWorkDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Hours Worked</label>
              <input type="number" value={hours} min="0" max="24" step="0.5" onChange={e => setHours(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cost Code</label>
              <select value={costCodeId} onChange={e => setCostCodeId(e.target.value)}>
                <option value="">Select cost code...</option>
                {costCodes.map(cc => (
                  <option key={cc.id} value={cc.id}>
                    {cc.code} — {cc.description} ({cc.job_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Per Diem Location</label>
              <select value={perDiemLoc} onChange={e => setPerDiemLoc(e.target.value)}>
                {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea rows="2" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about today's work..." />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" disabled={!costCodeId} onClick={() => setStep(3)}>
              Next: Proof Photo →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Proof Photo + Submit */}
      {step === 3 && (
        <div className="card">
          <h2>Step 3 — Proof of Presence Photo</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: 16, fontSize: 14 }}>
            Take a group photo of the crew at the job site to verify attendance.
          </p>
          <div className="photo-upload" onClick={() => fileInput.current?.click()}>
            <input ref={fileInput} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhoto} />
            {photoPreview ? (
              <img src={photoPreview} alt="Proof" />
            ) : (
              <div>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5" style={{ marginBottom: 8 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <div style={{ fontWeight: 600, color: 'var(--gray-700)' }}>Tap to take photo or upload</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>JPEG, PNG, or WebP up to 10MB</div>
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: 20, background: 'var(--gray-50)' }}>
            <h2>Submission Summary</h2>
            <table>
              <tbody>
                <tr><td style={{ fontWeight: 600, width: 150 }}>Crew Members</td><td>{selected.size} selected</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Date</td><td>{workDate}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Hours</td><td>{hours}h</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Cost Code</td><td>{costCodes.find(c => c.id === parseInt(costCodeId))?.code || '—'}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Per Diem</td><td>{LOCATIONS.find(l => l.value === perDiemLoc)?.label || 'None'}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Photo</td><td>{photo ? '✓ Attached' : 'No photo'}</td></tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
            <button
              className="btn btn-success"
              disabled={submitting}
              onClick={handleSubmit}
              style={{ fontSize: 16, padding: '12px 32px' }}
            >
              {submitting ? 'Submitting...' : `Submit ${selected.size} Entries`}
            </button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
