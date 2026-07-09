import './RetryState.css';
import Button from '../Button/Button';

export default function RetryState({
  title = 'Unable to load data',
  message = 'Something went wrong while fetching this content.',
  onRetry,
}) {
  return (
    <div className="retry-state" role="alert">
      <h3 className="retry-state__title">{title}</h3>
      <p className="retry-state__message">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}