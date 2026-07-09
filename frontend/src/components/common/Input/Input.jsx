import { forwardRef } from 'react';
import './Input.css';
import { classNames } from '../../../utils/classNames';

const Input = forwardRef(function Input(
  { label, error, helperText, id, className, ...rest },
  ref
) {
  const inputId = id || rest.name;

  return (
    <div className={classNames('field', error && 'field--error', className)}>
      {label && (
        <label htmlFor={inputId} className="field__label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className="field__input"
        aria-invalid={!!error}
        {...rest}
      />
      {error ? (
        <span className="field__message field__message--error">{error}</span>
      ) : helperText ? (
        <span className="field__message">{helperText}</span>
      ) : null}
    </div>
  );
});

export default Input;