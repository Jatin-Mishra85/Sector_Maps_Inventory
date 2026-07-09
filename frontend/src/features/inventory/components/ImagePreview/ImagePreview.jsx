import { useEffect, useRef, useState, useCallback } from 'react';
import './ImagePreview.css';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export default function ImagePreview({ isOpen, images, onClose }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastTapRef = useRef(0);
  const pinchStateRef = useRef(null);
  const dragStateRef = useRef(null);

  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (isOpen) resetView();
  }, [isOpen, resetView]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!document.fullscreenElement) {
      await el?.requestFullscreen?.().catch(() => {});
    } else {
      await document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleDoubleTapOrClick = (e) => {
    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < 300;
    lastTapRef.current = now;
    if (isDoubleTap || e.type === 'dblclick') {
      setScale((prev) => (prev > 1 ? 1 : 2.5));
      setTranslate({ x: 0, y: 0 });
    }
  };

  const getDistance = (touches) => {
    const [a, b] = touches;
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchStateRef.current = { initialDistance: getDistance(e.touches), initialScale: scale };
    } else if (e.touches.length === 1 && scale > 1) {
      dragStateRef.current = {
        startX: e.touches[0].clientX - translate.x,
        startY: e.touches[0].clientY - translate.y,
      };
    } else if (e.touches.length === 1) {
      handleDoubleTapOrClick(e);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStateRef.current) {
      const newDistance = getDistance(e.touches);
      const ratio = newDistance / pinchStateRef.current.initialDistance;
      const nextScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, pinchStateRef.current.initialScale * ratio)
      );
      setScale(nextScale);
    } else if (e.touches.length === 1 && dragStateRef.current && scale > 1) {
      setTranslate({
        x: e.touches[0].clientX - dragStateRef.current.startX,
        y: e.touches[0].clientY - dragStateRef.current.startY,
      });
    }
  };

  const handleTouchEnd = () => {
    pinchStateRef.current = null;
    dragStateRef.current = null;
  };

  if (!isOpen || !images.length) return null;
  const image = images[0];

  return (
    <div
      ref={containerRef}
      className="img-preview"
      role="dialog"
      aria-modal="true"
      aria-label={`Fullscreen preview of ${image.alt || 'image'}`}
    >
      <div className="img-preview__toolbar">
        <button type="button" className="img-preview__btn" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
          ⤢
        </button>
        <button type="button" className="img-preview__btn" onClick={onClose} aria-label="Close preview">
          ✕
        </button>
      </div>

      <div
        className="img-preview__stage"
        onDoubleClick={handleDoubleTapOrClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={image.url}
          alt={image.alt || ''}
          className="img-preview__image"
          style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})` }}
          draggable={false}
        />
      </div>
    </div>
  );
}