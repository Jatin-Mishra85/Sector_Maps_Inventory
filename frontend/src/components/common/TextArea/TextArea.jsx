import { forwardRef } from 'react';
import '../Input/Input.css';
import './TextArea.css';
import { classNames } from '../../../utils/classNames';

const TextArea = forwardRef(function TextArea(
  { label, error, helperText, id, rows = 4, className, ...rest },
  ref
) {
  const textAreaId = id || rest.name;

  return (
    <div className={classNames('field', error && 'field--error', className)}>
      {label && (
        <label htmlFor={textAreaId} className="field__label">
          {label}
        </label>
      )}
      <textarea
        id={textAreaId}
        ref={ref}
        rows={rows}
        className="field__input field__textarea"
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

export default TextArea;