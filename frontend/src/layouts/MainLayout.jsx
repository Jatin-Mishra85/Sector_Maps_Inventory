import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './MainLayout.css';
import { useSiteGate } from '../hooks/useSiteGate';
import { useAuth } from '../context/AuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import LoginModal from '../components/LoginModal/LoginModal';
import companyLogo from '../assets/logo/company-logo.png'; 


export default function MainLayout() {
  const { isUnlocked } = useSiteGate();
  const { user, logout } = useAuth();
  const { isAdminAuthenticated } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate('/');
  };

  const openLogin = () => {
    closeMenu();
    setLoginOpen(true);
  };

 

  const navLinkClass = ({ isActive }) =>
    `main-layout__nav-link ${isActive ? 'main-layout__nav-link--active' : ''}`;

  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div className="main-layout__container">
          <NavLink to="/" className="main-layout__brand" onClick={closeMenu}>
            <span className="main-layout__logo">
              <img src={companyLogo} alt="The Builder Bazar Logo" width="28" height="28" />
            </span>
            <span className="main-layout__brand-text">
              <span className="main-layout__brand-name">The Builder Bazar</span>
              <span className="main-layout__brand-subtitle">Sector Maps</span>
            </span>
          </NavLink>

          <nav className="main-layout__nav main-layout__nav--desktop">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            {isAdminAuthenticated && (
              <>
                <NavLink to="/admin" className={navLinkClass}>Add Inventory</NavLink>
                <NavLink to="/grouping" className={navLinkClass}>Grouping</NavLink>
                <NavLink to="/reports" className={navLinkClass}>Reports</NavLink>
              </>
            )}

            {user ? (
              <NavLink to="/profile" className="main-layout__profile-chip" aria-label={`Profile: ${user.name}`}>
                {user.picture ? (
                  <img src={user.picture} alt="" referrerPolicy="no-referrer" className="main-layout__profile-avatar" />
                ) : (
                  <span className="main-layout__profile-avatar main-layout__profile-avatar--fallback">
                    {user.name?.charAt(0)}
                  </span>
                )}
              </NavLink>
            ) : (
              <button type="button" className="main-layout__login-btn" onClick={openLogin}>
                Login
              </button>
            )}
          </nav>

          <button
            type="button"
            className={`main-layout__hamburger ${menuOpen ? 'main-layout__hamburger--open' : ''}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen && <div className="main-layout__overlay" onClick={closeMenu} />}

      <nav
        className={`main-layout__nav main-layout__nav--mobile ${menuOpen ? 'main-layout__nav--mobile-open' : ''}`}
      >
        <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>Home</NavLink>
        {isAdminAuthenticated && (
          <>
            <NavLink to="/admin" className={navLinkClass} onClick={closeMenu}>Add Inventory</NavLink>
            <NavLink to="/grouping" className={navLinkClass} onClick={closeMenu}>Grouping</NavLink>
            <NavLink to="/reports" className={navLinkClass} onClick={closeMenu}>Reports</NavLink>
          </>
        )}

        <div className="main-layout__nav-divider" />

        {user ? (
          <>
            <NavLink to="/profile" className="main-layout__nav-link" onClick={closeMenu}>
              Profile
            </NavLink>
            <button
              type="button"
              className="main-layout__nav-link main-layout__nav-link--logout"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            type="button"
            className="main-layout__login-btn main-layout__login-btn--mobile"
            onClick={openLogin}
          >
            Login
          </button>
        )}
      </nav>

      <main className="main-layout__content">
        <div className="main-layout__container">
          <Outlet />
        </div>
      </main>

      <footer className="main-layout__footer">
        <div className="main-layout__container">
          <span>&copy; {new Date().getFullYear()} The Builder Bazar. All rights reserved.</span>
        </div>
      </footer>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}