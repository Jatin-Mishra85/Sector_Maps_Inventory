import { useRef, useState, useEffect } from 'react';
import './FileUpload.css';
import { classNames } from '../../../utils/classNames';

export default function FileUpload({ label, error, helperText, onChange, value, accept = 'image/*' }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={classNames('field', 'file-upload', error && 'field--error')}>
      {label && <label className="field__label">{label}</label>}

      {previewUrl ? (
        <div className="file-upload__preview">
          <img src={previewUrl} alt="Selected inventory" />
          <button type="button" className="file-upload__remove" onClick={handleRemove}>
            Remove image
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="file-upload__dropzone"
          onClick={() => inputRef.current?.click()}
        >
          <span className="file-upload__icon" aria-hidden="true">⬆</span>
          <span>Click to upload an image</span>
          <span className="file-upload__hint">JPG or PNG, up to 5MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="file-upload__input"
        aria-label={label || 'Upload image'}
      />

      {error ? (
        <span className="field__message field__message--error">{error}</span>
      ) : helperText ? (
        <span className="field__message">{helperText}</span>
      ) : null}
    </div>
  );
}