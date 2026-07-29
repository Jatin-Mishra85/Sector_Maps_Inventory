import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return <div className="profile-page">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="profile-page">
        <p>Aap logged in nahi hain.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-page__card">
{user.picture && (
  <img
    src={user.picture}
    alt="Profile"
    referrerPolicy="no-referrer"
    className="profile-page__avatar"
  />
)}
        <h2 className="profile-page__name">{user.name}</h2>
        <p className="profile-page__email">{user.email}</p>

        <button className="profile-page__signout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}