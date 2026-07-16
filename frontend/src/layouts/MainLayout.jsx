import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import './MainLayout.css';
import { useSiteGate } from '../hooks/useSiteGate';

export default function MainLayout() {
  const { isUnlocked } = useSiteGate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const logoSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAbFBMVEURc74Jcb0AbrwDdsB+sdptq9iexeT3+v2bwuIHcL1joNLY5/P////r9PtcnNEpfsOItNzm8flnptXe7PaNu+A5iMc/jcno8/rB2e1IkczL3u8tgcTY4/G31Oqoy+YpgsVKls4AbLsAabre5vPVOeCxAAAAyklEQVR4AcXNRQLCMBQE0MZb/qTuLve/IzUc1kw8L+L8O4xz9tOEVA77cU1oY1zv22XmXAjWgvwvFoQRTKwMEhmw9+9SAEmWFwDCt49ZRqa0UV5ZW5q6eUUvj0jRhqSSJPvAViUH0icmXW82NH1Jb8iGtAZWLIA6Dd5QEshuaAmkvGfzKhh3rFe09agNXt7lKToxtDsOooScnnDSSOfsxLlHyl/RnYcDm2/IM9oxmz5xy4bb+Io8XNo1ZZaV27ioDR8672HsGDf7U64VVBK7Duk2pAAAAABJRU5ErkJggg==";

  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div className="main-layout__container">
          <Link to={isUnlocked ? '/' : '/admin'} className="main-layout__brand" onClick={closeMenu}>
            <span className="main-layout__logo">
              <img src={logoSrc} alt="The Builder Bazar Logo" width="28" height="28" />
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