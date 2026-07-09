import { forwardRef } from 'react';
import './Select.css';
import { classNames } from '../../../utils/classNames';

const Select = forwardRef(function Select(
  { label, error, helperText, id, options = [], placeholder = 'Select...', className, ...rest },
  ref
) {
  const selectId = id || rest.name;

  return (
    <div className={classNames('field', error && 'field--error', className)}>
      {label && (
        <label htmlFor={selectId} className="field__label">
          {label}
        </label>
      )}
      <select id={selectId} ref={ref} className="field__input field__select" aria-invalid={!!error} {...rest}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="field__message field__message--error">{error}</span>
      ) : helperText ? (
        <span className="field__message">{helperText}</span>
      ) : null}
    </div>
  );
});

export default Select;