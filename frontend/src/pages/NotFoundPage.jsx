import { Link } from 'react-router-dom';
import './NotFoundPage.css';
import Button from '../components/common/Button/Button';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <span className="not-found__code">404</span>
      <h1 className="not-found__title">Page not found</h1>
      <p className="not-found__description">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">Back to home</Button>
      </Link>
    </div>
  );
}