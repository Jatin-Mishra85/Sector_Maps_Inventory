import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './MainLayout.css';
import { useSiteGate } from '../hooks/useSiteGate';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal/LoginModal';

export default function MainLayout() {
  const { isUnlocked } = useSiteGate();
  const { user, logout } = useAuth();
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

  const logoSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAbFBMVEURc74Jcb0AbrwDdsB+sdptq9iexeT3+v2bwuIHcL1joNLY5/P////r9PtcnNEpfsOItNzm8flnptXe7PaNu+A5iMc/jcno8/rB2e1IkczL3u8tgcTY4/G31Oqoy+YpgsVKls4AbLsAabre5vPVOeCxAAAAyklEQVR4AcXNRQLCMBQE0MZb/qTuLve/IzUc1kw8L+L8O4xz9tOEVA77cU1oY1zv22XmXAjWgvwvFoQRTKwMEhmw9+9SAEmWFwDCt49ZRqa0UV5ZW5q6eUUvj0jRhqSSJPvAViUH0icmXW82NH1Jb8iGtAZWLIA6Dd5QEshuaAmkvGfzKhh3rFe09agNXt7lKToxtDsOooScnnDSSOfsxLlHyl/RnYcDm2/IM9oxmz5xy4bb+Io8XNo1ZZaV27ioDR8672HsGDf7U64VVBK7Duk2pAAAAABJRU5ErkJggg==";

  const navLinkClass = ({ isActive }) =>
    `main-layout__nav-link ${isActive ? 'main-layout__nav-link--active' : ''}`;

  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div className="main-layout__container">
          <NavLink to="/" className="main-layout__brand" onClick={closeMenu}>
            <span className="main-layout__logo">
              <img src={logoSrc} alt="The Builder Bazar Logo" width="28" height="28" />
            </span>
            <span className="main-layout__brand-text">
              <span className="main-layout__brand-name">The Builder Bazar</span>
              <span className="main-layout__brand-subtitle">Sector Maps</span>
            </span>
          </NavLink>

          <nav className="main-layout__nav main-layout__nav--desktop">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/admin" className={navLinkClass}>Add Inventory</NavLink>
            <NavLink to="/grouping" className={navLinkClass}>Grouping</NavLink>

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
        <NavLink to="/admin" className={navLinkClass} onClick={closeMenu}>Add Inventory</NavLink>
        <NavLink to="/grouping" className={navLinkClass} onClick={closeMenu}>Grouping</NavLink>

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