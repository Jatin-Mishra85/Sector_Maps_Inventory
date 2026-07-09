import { memo } from 'react';
import './SearchBar.css';
import Input from '../../../../components/common/Input/Input';

function SearchBar({ value, onChange, placeholder = 'Search by project, sector, or developer' }) {
  return (
    <div className="search-bar">
      <Input
        name="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search inventories"
        className="search-bar__input"
      />
    </div>
  );
}

export default memo(SearchBar);