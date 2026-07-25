import { useEffect, useRef, useState, useCallback } from 'react';
import './ImagePreview.css';

const MIN_SCALE = 1;
const MAX_SCALE = 50;

export default function ImagePreview({ isOpen, images, onClose }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const lastTapRef = useRef(0);
  const pinchStateRef = useRef(null);
  const dragStateRef = useRef(null);
  const pushedHistoryRef = useRef(false);

  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  // Auto fullscreen on open, auto exit on close
  useEffect(() => {
    if (isOpen) {
      resetView();
      setRotation(0);
      const el = containerRef.current;
      if (el && !document.fullscreenElement) {
        el.requestFullscreen?.().catch(() => {});
      }
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [isOpen, resetView]);

  // --- Back button handling ---
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ imgPreview: true }, '');
      pushedHistoryRef.current = true;
    }

    function handlePopState() {
      if (pushedHistoryRef.current) {
        pushedHistoryRef.current = false;
        onClose();
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // --- THE FIX ---
  // Mobile browsers intercept the FIRST back press to just exit fullscreen
  // (popstate doesn't fire on that press). So we detect that fullscreen
  // exit ourselves, and if our dummy history entry is still sitting there,
  // we pop it immediately -> triggers popstate -> closes overlay.
  // Result: a single back press does everything in one go.
  useEffect(() => {
    function handleFullscreenChange() {
      if (!document.fullscreenElement && isOpen && pushedHistoryRef.current) {
        window.history.back();
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isOpen]);

  // Close via UI button (X) — pop the dummy history entry ourselves,
  // which triggers popstate -> onClose. Fullscreen exit happens
  // automatically via the isOpen effect above.
  const handleClose = useCallback(() => {
    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false;
      window.history.back();
    } else {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;
      if (e.key === 'Escape') handleClose();
      if (e.key === 'r' || e.key === 'R') rotateImage();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, handleClose]);

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
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
  const isSideways = rotation % 180 !== 0;

  return (
    <div
      ref={containerRef}
      className="img-preview"
      role="dialog"
      aria-modal="true"
      aria-label={`Fullscreen preview of ${image.alt || 'image'}`}
    >
      <div className="img-preview__toolbar">
        <button
          type="button"
          className="img-preview__btn"
          onClick={rotateImage}
          aria-label="Rotate image"
          title="Rotate (R)"
        >
          ↻
        </button>
        <button type="button" className="img-preview__btn" onClick={handleClose} aria-label="Close preview">
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
          style={{
            transform: `translate3d(${translate.x}px, ${translate.y}px, 0) rotate(${rotation}deg) scale(${scale})`,
            // maxWidth: isSideways ? '82vh' : '96vw',
            // maxHeight: isSideways ? '96vw' : '82vh',
            maxWidth: undefined,
maxHeight: undefined,
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}