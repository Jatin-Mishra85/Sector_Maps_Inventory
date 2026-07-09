import { memo } from 'react';
import './InventoryTypeBadge.css';
import { INVENTORY_TYPE_LABELS } from '../../../../constants/appConstants';
import { classNames } from '../../../../utils/classNames';

function InventoryTypeBadge({ type }) {
  const label = INVENTORY_TYPE_LABELS[type] || type;
  return (
    <span className={classNames('type-badge', `type-badge--${String(type).toLowerCase()}`)}>
      {label}
    </span>
  );
}

export default memo(InventoryTypeBadge);