import { useEffect, useState } from 'react';
import './ReportsPage.css';
import { interactionsService } from '../../../services/interactionsService';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      setError(null);
      try {
        const response = await interactionsService.getAllReports();
        setReports(response?.data || []);
      } catch (err) {
        setError('Reports load nahi ho paye.');
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  return (
    <div className="reports-page">
      <h1 className="reports-page__title">Reports</h1>

      {loading && <p className="reports-page__status">Loading...</p>}
      {error && <p className="reports-page__status reports-page__status--error">{error}</p>}

      {!loading && !error && (
        <div className="reports-page__table-wrap">
          <table className="reports-page__table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={3} className="reports-page__empty">Koi report nahi mila.</td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.ReportId}>
                    <td>{new Date(r.ReportedAt).toLocaleString()}</td>
                    <td>{r.UserName || r.UserEmail || 'Anonymous'}</td>
                    <td>
                      <strong>{r.Reason}</strong>
                      {r.Details ? ` — ${r.Details}` : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}