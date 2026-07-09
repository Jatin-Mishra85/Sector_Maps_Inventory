import './EmptyState.css';
import Button from '../Button/Button';

export default function EmptyState({
  title = 'Nothing to show yet',
  description,
  actionLabel,
  onAction,
  icon,
}) {
  return (
    <div className="empty-state">
      {icon ? <div className="empty-state__icon">{icon}</div> : null}
      <h3 className="empty-state__title">{title}</h3>
      {description ? <p className="empty-state__description">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="primary" onClick={onAction} className="empty-state__action">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}