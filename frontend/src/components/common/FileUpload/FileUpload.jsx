import { useRef, useState, useEffect } from 'react';
import './FileUpload.css';
import { classNames } from '../../../utils/classNames';
import ImageCropModal from '../ImageCropModal/ImageCropModal';

export default function FileUpload({ label, error, helperText, onChange, value, accept = 'image/*' }) {
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // Gallery ya Camera se file select hone ke baad, crop step khatam hone
  // tak uska temporary object URL yahan rehta hai.
  const [pendingImageSrc, setPendingImageSrc] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  // Gallery ya Camera — dono se select hone ke baad seedha onChange nahi
  // chalta, pehle chhota crop/rotate editor khulta hai.
  const handleFilePicked = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setPendingImageSrc(URL.createObjectURL(file));
    e.target.value = ''; // taaki wahi file dobara select karne par bhi change event chale
  };

  const handleCropConfirm = (croppedFile) => {
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingImageSrc(null);
    onChange(croppedFile);
  };

  const handleCropCancel = () => {
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingImageSrc(null);
  };

  const handleRemove = () => {
    onChange(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
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
        <div className="file-upload__source-buttons">
          <button
            type="button"
            className="file-upload__dropzone"
            onClick={() => galleryInputRef.current?.click()}
          >
            <span className="file-upload__icon" aria-hidden="true">⬆</span>
            <span>Choose from Gallery</span>
            <span className="file-upload__hint">JPG or PNG, up to 5MB</span>
          </button>

          <button
            type="button"
            className="file-upload__camera-btn"
            onClick={() => cameraInputRef.current?.click()}
          >
            <span className="file-upload__icon" aria-hidden="true">📷</span>
            <span>Take Photo</span>
          </button>
        </div>
      )}

      <input
        ref={galleryInputRef}
        type="file"
        accept={accept}
        onChange={handleFilePicked}
        className="file-upload__input"
        aria-label={label || 'Upload image'}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept={accept}
        capture="environment"
        onChange={handleFilePicked}
        className="file-upload__input"
        aria-label="Take a photo"
      />

      {error ? (
        <span className="field__message field__message--error">{error}</span>
      ) : helperText ? (
        <span className="field__message">{helperText}</span>
      ) : null}

      {pendingImageSrc && (
        <ImageCropModal imageSrc={pendingImageSrc} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />
      )}
    </div>
  );
}