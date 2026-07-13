import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import './MainLayout.css';
import { useSiteGate } from '../hooks/useSiteGate';

export default function MainLayout() {
  const { isUnlocked } = useSiteGate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div className="main-layout__container">
          <Link to={isUnlocked ? '/' : '/admin'} className="main-layout__brand" onClick={closeMenu}>
            <span className="main-layout__logo" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
                <rect x="6" y="16" width="14" height="26" rx="1.5" fill="currentColor" opacity="0.9" />
                <rect x="22" y="8" width="14" height="34" rx="1.5" fill="currentColor" />
                <rect x="38" y="20" width="6" height="22" rx="1" fill="currentColor" opacity="0.7" />
                <rect x="9" y="20" width="3" height="3" fill="var(--color-primary)" />
                <rect x="14" y="20" width="3" height="3" fill="var(--color-primary)" />
                <rect x="9" y="26" width="3" height="3" fill="var(--color-primary)" />
                <rect x="14" y="26" width="3" height="3" fill="var(--color-primary)" />
                <rect x="26" y="13" width="3" height="3" fill="var(--color-primary)" />
                <rect x="31" y="13" width="3" height="3" fill="var(--color-primary)" />
                <rect x="26" y="19" width="3" height="3" fill="var(--color-primary)" />
                <rect x="31" y="19" width="3" height="3" fill="var(--color-primary)" />
                <rect x="26" y="25" width="3" height="3" fill="var(--color-primary)" />
                <rect x="31" y="25" width="3" height="3" fill="var(--color-primary)" />
              </svg>
            </span>
            <span className="main-layout__brand-text">
              <span className="main-layout__brand-name">The Builder Bazar</span>
              <span className="main-layout__brand-subtitle">Sector Maps</span>
            </span>
          </Link>

          <nav className="main-layout__nav main-layout__nav--desktop">
            {isUnlocked && (
              <Link to="/" className="main-layout__nav-link">Home</Link>
            )}
            <Link to="/admin" className="main-layout__nav-link">Add Inventory</Link>
            <Link to="/grouping" className="main-layout__nav-link">Grouping</Link>
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

        <nav className={`main-layout__nav main-layout__nav--mobile ${menuOpen ? 'main-layout__nav--mobile-open' : ''}`}>
          {isUnlocked && (
            <Link to="/" className="main-layout__nav-link" onClick={closeMenu}>Home</Link>
          )}
          <Link to="/admin" className="main-layout__nav-link" onClick={closeMenu}>Add Inventory</Link>
          <Link to="/grouping" className="main-layout__nav-link" onClick={closeMenu}>Grouping</Link>
        </nav>
      </header>

      {menuOpen && <div className="main-layout__overlay" onClick={closeMenu} />}

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
    </div>
  );
}