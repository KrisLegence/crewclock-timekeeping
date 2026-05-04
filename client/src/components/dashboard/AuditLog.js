import React, { useState, useEffect } from 'react';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [tableFilter, setTableFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (tableFilter) params.set('table_name', tableFilter);
    params.set('limit', '100');
    fetch(`/api/audit-logs?${params}`).then(r => r.json()).then(setLogs).catch(() => {});
  }, [tableFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>SOX Audit Trail</h1>
          <div className="subtitle">Every UPDATE and DELETE is recorded with before/after state.</div>
        </div>
        <select value={tableFilter} onChange={e => setTableFilter(e.target.value)} style={{ width: 200 }}>
          <option value="">All Tables</option>
          <option value="time_entries">Time Entries</option>
          <option value="employees">Employees</option>
          <option value="cost_codes">Cost Codes</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Table</th>
              <th>Record</th>
              <th>Action</th>
              <th>Changed By</th>
              <th>Reason</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>
                No audit log entries found. Logs are created when records are updated or deleted.
              </td></tr>
            ) : logs.map(log => (
              <React.Fragment key={log.id}>
                <tr>
                  <td style={{ fontSize: 12, fontFamily: 'monospace' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td><span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>{log.table_name}</span></td>
                  <td>#{log.record_id}</td>
                  <td>
                    <span className={`badge ${log.action === 'DELETE' ? 'badge-flagged' : 'badge-pending'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.first_name ? `${log.first_name} ${log.last_name}` : `User #${log.changed_by}`}</td>
                  <td>{log.change_reason || '—'}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                      {expandedId === log.id ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
                {expandedId === log.id && (
                  <tr>
                    <td colSpan="7" style={{ background: 'var(--gray-50)', padding: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <strong style={{ fontSize: 12, color: 'var(--red-500)' }}>BEFORE</strong>
                          <pre style={{
                            background: '#fef2f2', padding: 12, borderRadius: 6, fontSize: 12,
                            overflow: 'auto', maxHeight: 300, marginTop: 4,
                          }}>
                            {log.before_state ? JSON.stringify(log.before_state, null, 2) : 'N/A'}
                          </pre>
                        </div>
                        <div>
                          <strong style={{ fontSize: 12, color: 'var(--green-600)' }}>AFTER</strong>
                          <pre style={{
                            background: '#f0fdf4', padding: 12, borderRadius: 6, fontSize: 12,
                            overflow: 'auto', maxHeight: 300, marginTop: 4,
                          }}>
                            {log.after_state ? JSON.stringify(log.after_state, null, 2) : 'N/A (deleted)'}
                          </pre>
                        </div>
                      </div>
                      {log.change_note && (
                        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--gray-700)' }}>
                          <strong>Note:</strong> {log.change_note}
                        </div>
                      )}
                      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--gray-500)' }}>
                        IP: {log.ip_address || '—'} · UA: {(log.user_agent || '—').substring(0, 60)}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
