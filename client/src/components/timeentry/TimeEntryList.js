import React, { useState, useEffect } from 'react';

const STATUS_BADGE = {
  pending: 'badge-pending',
  approved: 'badge-approved',
  flagged: 'badge-flagged',
  rejected: 'badge-rejected',
};

export default function TimeEntryList() {
  const [entries, setEntries] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (dateFilter) params.set('date', dateFilter);
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/time-entries?${params}`).then(r => r.json()).then(setEntries).catch(() => {});
  };

  useEffect(load, [dateFilter, statusFilter]);

  const handleApprove = async (id) => {
    await fetch(`/api/time-entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'approved',
        reason_code: 'supervisor_override',
        approved_by: 10,
        changed_by: 10,
      }),
    });
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Time Entries</h1>
          <div className="subtitle">{entries.length} entries</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ width: 180 }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="flagged">Flagged</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Cost Code</th>
              <th>Reg</th>
              <th>OT</th>
              <th>DT</th>
              <th>Per Diem</th>
              <th>Source</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>No entries found</td></tr>
            ) : entries.map(e => (
              <tr key={e.id}>
                <td style={{ fontWeight: 600 }}>{e.first_name} {e.last_name}<br/><span style={{ fontSize: 11, color: 'var(--gray-500)' }}>{e.employee_number}</span></td>
                <td>{new Date(e.work_date).toLocaleDateString()}</td>
                <td><span style={{ fontFamily: 'monospace' }}>{e.cost_code_value}</span><br/><span style={{ fontSize: 11, color: 'var(--gray-500)' }}>{e.job_number}</span></td>
                <td>{Number(e.hours_regular).toFixed(1)}</td>
                <td>{Number(e.hours_overtime) > 0 ? <strong style={{ color: 'var(--amber-500)' }}>{Number(e.hours_overtime).toFixed(1)}</strong> : '—'}</td>
                <td>{Number(e.hours_double) > 0 ? <strong style={{ color: 'var(--red-500)' }}>{Number(e.hours_double).toFixed(1)}</strong> : '—'}</td>
                <td>{Number(e.per_diem) > 0 ? `$${Number(e.per_diem).toFixed(0)}` : '—'}</td>
                <td><span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>{e.source}</span></td>
                <td><span className={`badge ${STATUS_BADGE[e.status]}`}>{e.status}</span></td>
                <td>
                  {e.status === 'pending' && (
                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(e.id)}>Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
