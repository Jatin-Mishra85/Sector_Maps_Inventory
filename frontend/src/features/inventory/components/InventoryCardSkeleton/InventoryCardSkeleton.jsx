import './InventoryCardSkeleton.css';

export default function InventoryCardSkeleton() {
  return (
    <div className="inv-skel" aria-hidden="true">
      <div className="inv-skel__image" />
      <div className="inv-skel__line inv-skel__line--title" />
      <div className="inv-skel__line inv-skel__line--meta" />
      <div className="inv-skel__actions">
        <span className="inv-skel__pill" />
        <span className="inv-skel__pill" />
        <span className="inv-skel__pill" />
        <span className="inv-skel__pill" />
      </div>
    </div>
  );
}