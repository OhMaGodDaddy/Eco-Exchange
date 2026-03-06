import { useEffect, useState } from 'react';

const API_BASE = 'https://eco-exchange-api.onrender.com';

export default function AdminModeration({ user }) {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('pending');

  const loadReports = async () => {
    const res = await fetch(`${API_BASE}/api/admin/reports?status=${status}`, { credentials: 'include' });
    const data = await res.json();
    setReports(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (user?.role === 'admin') loadReports();
  }, [status, user]);

  const updateReport = async (id, nextStatus, removeItem = false) => {
    await fetch(`${API_BASE}/api/admin/reports/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus, removeItem }),
    });
    loadReports();
  };

  if (user?.role !== 'admin') return <div className="p-6">Admin access only.</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Moderation</h1>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded p-2 mb-4">
        <option value="pending">Pending</option>
        <option value="reviewed">Reviewed</option>
        <option value="resolved">Resolved</option>
      </select>
      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report._id} className="border rounded p-4 bg-white">
            <div className="font-semibold">Reason: {report.reason}</div>
            <div className="text-sm text-slate-600">Item: {report.reportedItemId || 'N/A'} • Reporter: {report.reporterUserId}</div>
            <div className="text-sm mt-1">{report.description || 'No description provided.'}</div>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 rounded bg-slate-200" onClick={() => updateReport(report._id, 'reviewed')}>Mark Reviewed</button>
              <button className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={() => updateReport(report._id, 'resolved')}>Resolve</button>
              {report.reportedItemId && <button className="px-3 py-1 rounded bg-rose-600 text-white" onClick={() => updateReport(report._id, 'resolved', true)}>Resolve + Remove Item</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
