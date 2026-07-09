import { Outlet, Link } from 'react-router-dom';
import './MainLayout.css';
import { useSiteGate } from '../hooks/useSiteGate';

export default function MainLayout() {
  const { isUnlocked } = useSiteGate();

  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div className="main-layout__container">
          <Link to={isUnlocked ? '/' : '/admin'} className="main-layout__brand">
            YourBrand
          </Link>
          <nav className="main-layout__nav">
            {isUnlocked && (
              <Link to="/" className="main-layout__nav-link">Home</Link>
            )}
            <Link to="/admin" className="main-layout__nav-link">Add Inventory</Link>
          </nav>
        </div>
      </header>

      <main className="main-layout__content">
        <div className="main-layout__container">
          <Outlet />
        </div>
      </main>

      <footer className="main-layout__footer">
        <div className="main-layout__container">
          <span>&copy; {new Date().getFullYear()} YourBrand. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}