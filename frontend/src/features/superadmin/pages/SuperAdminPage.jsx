import { useEffect, useState } from 'react';
import './SuperAdminPage.css';
import { superAdminService } from '../services/superAdminService';

export default function SuperAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.getAllUsers();
      setUsers(response?.data || []);
    } catch (err) {
      setError('Users load nahi ho paye.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (userId) => {
    setBusyId(userId);
    try {
      await superAdminService.toggleAdmin(userId);
      await fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to toggle admin.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleBlock = async (userId) => {
    setBusyId(userId);
    try {
      await superAdminService.toggleBlock(userId);
      await fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to toggle block.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="superadmin-page">
      <h1 className="superadmin-page__title">Manage Users</h1>

      {loading && <p className="superadmin-page__status">Loading...</p>}
      {error && <p className="superadmin-page__status superadmin-page__status--error">{error}</p>}

      {!loading && !error && (
        <div className="superadmin-page__table-wrap">
          <table className="superadmin-page__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Block</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.isSuperAdmin ? (
                      <span className="superadmin-page__badge">SuperAdmin</span>
                    ) : (
                      <button
                        type="button"
                        className={`superadmin-page__toggle ${u.isAdmin ? 'superadmin-page__toggle--on' : ''}`}
                        disabled={busyId === u.userId}
                        onClick={() => handleToggleAdmin(u.userId)}
                      >
                        {u.isAdmin ? 'Admin' : 'Not Admin'}
                      </button>
                    )}
                  </td>
                  <td>
                    {u.isSuperAdmin ? (
                      <span className="superadmin-page__badge">—</span>
                    ) : (
                      <button
                        type="button"
                        className={`superadmin-page__toggle ${u.isBlocked ? 'superadmin-page__toggle--blocked' : ''}`}
                        disabled={busyId === u.userId}
                        onClick={() => handleToggleBlock(u.userId)}
                      >
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}