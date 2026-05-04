import React, { useState } from 'react';

export default function ExportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    const res = await fetch(`/api/export/sage300/preview?start_date=${startDate}&end_date=${endDate}`);
    const data = await res.json();
    setPreview(data);
    setLoading(false);
  };

  const handleDownload = () => {
    if (!startDate || !endDate) return;
    window.open(`/api/export/sage300?start_date=${startDate}&end_date=${endDate}`, '_blank');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Sage 300 CRE Export</h1>
          <div className="subtitle">Generate .PRT (Payroll Transaction) file for import into Sage 300 CRE.</div>
        </div>
      </div>

      <div className="card">
        <h2>Select Pay Period</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" onClick={handlePreview} disabled={loading || !startDate || !endDate}>
            {loading ? 'Loading...' : 'Preview Export'}
          </button>
          <button className="btn btn-success" onClick={handleDownload} disabled={!startDate || !endDate}>
            Download .PRT File
          </button>
        </div>
      </div>

      {preview && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>Preview: {preview.filename}</h2>
            <span className="badge badge-approved">{preview.row_count} transaction rows</span>
          </div>

          {preview.row_count === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)' }}>
              No approved entries found for this date range. Approve entries first, then export.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Employee#</th>
                    <th>Date</th>
                    <th>Job#</th>
                    <th>Cost Code</th>
                    <th>Earning</th>
                    <th>Hours</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace' }}>{row['Employee#']}</td>
                      <td>{row['Trans Date']}</td>
                      <td>{row['Job#']}</td>
                      <td style={{ fontFamily: 'monospace' }}>{row['Cost Code']}</td>
                      <td>
                        <span className="badge" style={{
                          background: row['Earning Code'] === 'REG' ? '#d1fae5' :
                                     row['Earning Code'] === 'OT' ? '#fef3c7' :
                                     row['Earning Code'] === 'DT' ? '#fee2e2' : '#e0e7ff',
                          color: row['Earning Code'] === 'REG' ? '#065f46' :
                                 row['Earning Code'] === 'OT' ? '#92400e' :
                                 row['Earning Code'] === 'DT' ? '#991b1b' : '#3730a3',
                        }}>
                          {row['Earning Code']}
                        </span>
                      </td>
                      <td>{row['Hours']}</td>
                      <td style={{ fontWeight: 600 }}>${parseFloat(row['Amount'] || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ background: 'var(--gray-50)', marginTop: 8 }}>
        <h2>Sage 300 CRE Import Instructions</h2>
        <ol style={{ paddingLeft: 20, fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          <li>Download the .PRT file using the button above.</li>
          <li>Open Sage 300 CRE → Payroll → Payroll Transactions → Import.</li>
          <li>Select "CSV/Delimited" as the file format.</li>
          <li>Browse to the downloaded .PRT file.</li>
          <li>Map columns (they should auto-map if using default Sage 300 field names).</li>
          <li>Review the import preview and click "Process."</li>
        </ol>
      </div>
    </div>
  );
}
