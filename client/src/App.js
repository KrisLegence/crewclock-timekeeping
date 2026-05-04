import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import HuddleEntry from './components/huddle/HuddleEntry';
import TimeEntryList from './components/timeentry/TimeEntryList';
import ManualEntry from './components/timeentry/ManualEntry';
import ValidationDashboard from './components/dashboard/ValidationDashboard';
import ExportPage from './components/dashboard/ExportPage';
import AuditLog from './components/dashboard/AuditLog';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">Crew<span>Clock</span></div>
          <nav>
            <NavLink to="/" end>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/huddle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              <span>Crew Huddle</span>
            </NavLink>
            <NavLink to="/entries">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Time Entries</span>
            </NavLink>
            <NavLink to="/manual">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>Manual Entry</span>
            </NavLink>
            <NavLink to="/validation">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Review &amp; Fix</span>
            </NavLink>
            <NavLink to="/export">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Sage 300 Export</span>
            </NavLink>
            <NavLink to="/audit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Audit Trail</span>
            </NavLink>
          </nav>
          <div style={{padding:'0 20px',fontSize:'11px',color:'rgba(255,255,255,0.3)'}}>
            v1.0 · SOX Compliant
          </div>
        </aside>

        <main className="main">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/huddle" element={<HuddleEntry />} />
            <Route path="/entries" element={<TimeEntryList />} />
            <Route path="/manual" element={<ManualEntry />} />
            <Route path="/validation" element={<ValidationDashboard />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/audit" element={<AuditLog />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function DashboardHome() {
  const [stats, setStats] = React.useState({ entries: 0, pending: 0, flags: 0, employees: 0 });

  React.useEffect(() => {
    Promise.all([
      fetch('/api/time-entries').then(r => r.json()),
      fetch('/api/time-entries?status=pending').then(r => r.json()),
      fetch('/api/validation/flags').then(r => r.json()),
      fetch('/api/employees?active=true').then(r => r.json()),
    ]).then(([all, pending, flags, emps]) => {
      setStats({
        entries: all.length,
        pending: pending.length,
        flags: flags.length,
        employees: emps.length,
      });
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="subtitle">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{stats.employees}</div>
          <div className="label">Active Employees</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.entries}</div>
          <div className="label">Total Entries</div>
        </div>
        <div className="stat-card">
          <div className="value" style={{color:'var(--amber-500)'}}>{stats.pending}</div>
          <div className="label">Pending Review</div>
        </div>
        <div className="stat-card">
          <div className="value" style={{color:'var(--red-500)'}}>{stats.flags}</div>
          <div className="label">Validation Flags</div>
        </div>
      </div>
      <div className="card">
        <h2>Quick Actions</h2>
        <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
          <a href="/huddle" className="btn btn-primary">Start Crew Huddle</a>
          <a href="/manual" className="btn btn-outline">Manual Entry</a>
          <a href="/validation" className="btn btn-danger">Review Flags</a>
          <a href="/export" className="btn btn-success">Export to Sage 300</a>
        </div>
      </div>
    </div>
  );
}

export default App;
