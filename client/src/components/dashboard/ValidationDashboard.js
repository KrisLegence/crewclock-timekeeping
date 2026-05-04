import React, { useState, useEffect } from 'react';

const FLAG_LABELS = {
  excessive_hours: 'Excessive Hours (16+)',
  missing_cost_code: 'Missing/Inactive Cost Code',
  duplicate_entry: 'Duplicate Entry',
  missing_punch: 'Missing Clock-In',
};

const FLAG_COLORS = {
  excessive_hours: '#dc2626',
  missing_cost_code: '#d97706',
  duplicate_entry: '#7c3aed',
  missing_punch: '#2563eb',
};

export default function ValidationDashboard() {
  const [flags, setFlags] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [toast, setToast] = useState('');

  const loadFlags = () => {
    fetch('/api/validation/flags').then(r => r.json()).then(setFlags).catch(() => {});
  };

  useEffect(loadFlags, []);

  const runScan = async () => {
    setScanning(true);
    const res = await fetch('/api/validation/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const result = await res.json();
    setScanResult(result);
    loadFlags();
    setScanning(false);
  };

  const resolveFlag = async (id) => {
    await fetch(`/api/validation/flags/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved_by: 10 }),
    });
    setToast('Flag resolved');
    setTimeout(() => setToast(''), 2000);
    loadFlags();
  };

  const grouped = {};
  flags.forEach(f => {
    if (!grouped[f.flag_type]) grouped[f.flag_type] = [];
    grouped[f.flag_type].push(f);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Review &amp; Fix</h1>
          <div className="subtitle">Validation engine — flags the 10% errors for your review.</div>
        </div>
        <button className="btn btn-primary" onClick={runScan} disabled={scanning}>
          {scanning ? 'Scanning...' : 'Run Validation Scan'}
        </button>
      </div>

      {scanResult && (
        <div className="card" style={{ background: '#f0fdf4', borderLeft: '4px solid var(--green-600)' }}>
          Scan complete: {scanResult.scanned} potential issues found, {scanResult.new_flags} new flags created.
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value" style={{ color: 'var(--red-500)' }}>{flags.length}</div>
          <div className="label">Open Flags</div>
        </div>
        {Object.entries(grouped).map(([type, items]) => (
          <div className="stat-card" key={type}>
            <div className="value" style={{ color: FLAG_COLORS[type] || 'var(--gray-700)' }}>{items.length}</div>
            <div className="label">{FLAG_LABELS[type] || type}</div>
          </div>
        ))}
      </div>

      {flags.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--gray-500)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2" style={{ marginBottom: 12 }}>
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--green-600)' }}>All Clear</div>
          <div>No unresolved validation flags. Run a scan to check for issues.</div>
        </div>
      ) : (
        Object.entries(grouped).map(([type, items]) => (
          <div key={type} style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px',
              color: FLAG_COLORS[type] || 'var(--gray-700)', marginBottom: 12,
            }}>
              {FLAG_LABELS[type] || type} ({items.length})
            </h3>
            {items.map(flag => (
              <div className="flag-card" key={flag.id}>
                <div className="flag-info">
                  <div className="flag-type">{flag.flag_type.replace(/_/g, ' ')}</div>
                  <div className="flag-msg">{flag.flag_message}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
                    {flag.first_name} {flag.last_name} ({flag.employee_number}) · {new Date(flag.work_date).toLocaleDateString()} · {flag.cost_code_value}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => window.location.href = `/entries`}>
                    View Entry
                  </button>
                  <button className="btn btn-success btn-sm" onClick={() => resolveFlag(flag.id)}>
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
