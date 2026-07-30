import { useEffect, useRef, useState, useCallback } from 'react';
import './ImagePreview.css';

const MIN_SCALE = 1;
const MAX_SCALE = 8; // 50 was almost certainly a typo/leftover — 50x on a phone
                      // screen is unusable and makes float precision errors
                      // (and therefore drift) much more visible. Raise it back
                      // if you really need it, the math below works at any value.
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_DELAY = 300; // ms
const DOUBLE_TAP_MAX_DIST = 30; // px — two taps further apart than this are two separate single taps, not a double-tap

export default function ImagePreview({ isOpen, images, onClose }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const imageRef = useRef(null);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false); // true only while actively pinching/dragging -> disables the CSS transition so it doesn't fight the gesture

  const lastTapRef = useRef({ time: 0, x: 0, y: 0 });
  const pinchStateRef = useRef(null); // { initialDistance, initialScale }
  const dragStateRef = useRef(null); // { startX, startY }
  const gestureMetaRef = useRef(null); // dimensions cached once per gesture (avoids layout thrashing)
  const rafRef = useRef(null);
  const pendingTransformRef = useRef(null); // latest computed {scale, translate} waiting to be flushed on next frame
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

  useEffect(() => {
    function handleFullscreenChange() {
      if (!document.fullscreenElement && isOpen && pushedHistoryRef.current) {
        window.history.back();
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isOpen]);

  // FIX: don't reset pushedHistoryRef here — the popstate handler above is
  // the single source of truth for clearing it. Resetting it here too meant
  // that by the time the async `history.back()` actually fired popstate,
  // the ref was already false, so the popstate handler's `onClose()` never
  // ran — leaving the preview open until a *second* click hit the `else`
  // branch and called onClose() directly. One click now correctly triggers
  // history.back() -> popstate -> onClose(), in that order, every time.
  const handleClose = useCallback(() => {
    if (pushedHistoryRef.current) {
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

  // ---------- Geometry helpers ----------

  // Measures the stage + the image's *unscaled, unrotated* layout box.
  // Called once per gesture (touchstart / double-tap), never inside a
  // touchmove loop — reading getBoundingClientRect/offsetWidth every frame
  // forces a synchronous layout ("layout thrashing") and is a major source
  // of jank on Android.
  const measureGesture = useCallback(() => {
    const stage = stageRef.current;
    const img = imageRef.current;
    if (!stage || !img) return null;

    const stageRect = stage.getBoundingClientRect();
    return {
      stageCenterX: stageRect.left + stageRect.width / 2,
      stageCenterY: stageRect.top + stageRect.height / 2,
      stageWidth: stageRect.width,
      stageHeight: stageRect.height,
      // offsetWidth/Height = the CSS layout box (object-fit: contain sizing),
      // untouched by the transform — this is the correct "base" size to scale from.
      baseWidth: img.offsetWidth,
      baseHeight: img.offsetHeight,
    };
  }, []);

  // How far translate is allowed to go at a given scale, so the image can
  // never be dragged/zoomed fully off-screen. Pure arithmetic, no DOM reads.
  const getBounds = (meta, scaleValue, rotated) => {
    const baseW = rotated ? meta.baseHeight : meta.baseWidth;
    const baseH = rotated ? meta.baseWidth : meta.baseHeight;
    const scaledW = baseW * scaleValue;
    const scaledH = baseH * scaleValue;
    const overflowX = Math.max(0, (scaledW - meta.stageWidth) / 2);
    const overflowY = Math.max(0, (scaledH - meta.stageHeight) / 2);
    return { minX: -overflowX, maxX: overflowX, minY: -overflowY, maxY: overflowY };
  };

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const clampTranslate = (meta, scaleValue, rotated, t) => {
    const b = getBounds(meta, scaleValue, rotated);
    return { x: clamp(t.x, b.minX, b.maxX), y: clamp(t.y, b.minY, b.maxY) };
  };

  // Core zoom-toward-a-point formula. `anchor` is expressed as an offset
  // from the stage's own center (NOT raw screen coordinates). Rotation is
  // not needed here — because translate is applied outside rotate/scale in
  // the transform string, it cancels out algebraically, so this formula is
  // correct regardless of the current rotation.
  const zoomAround = (anchorX, anchorY, oldScale, oldTranslate, newScale) => {
    const ratio = newScale / oldScale;
    return {
      x: anchorX * (1 - ratio) + oldTranslate.x * ratio,
      y: anchorY * (1 - ratio) + oldTranslate.y * ratio,
    };
  };

  // ---------- rAF-batched state flush ----------
  // touchmove can fire 60-120x/sec on Android. We compute the new
  // scale/translate synchronously (cheap) but only commit to React state
  // once per animation frame, so React never re-renders faster than the
  // screen can draw.
  const scheduleFlush = (next) => {
    pendingTransformRef.current = next;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const pending = pendingTransformRef.current;
      if (!pending) return;
      setScale(pending.scale);
      setTranslate(pending.translate);
    });
  };

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  // ---------- Tap / double-tap ----------

  const applyDoubleTap = (clientX, clientY) => {
    const meta = measureGesture();
    if (!meta) return;

    const goingIn = scale <= MIN_SCALE + 0.01;
    const nextScale = goingIn ? DOUBLE_TAP_SCALE : MIN_SCALE;

    let nextTranslate = { x: 0, y: 0 };
    if (goingIn) {
      const anchorX = clientX - meta.stageCenterX;
      const anchorY = clientY - meta.stageCenterY;
      nextTranslate = zoomAround(anchorX, anchorY, scale, translate, nextScale);
      nextTranslate = clampTranslate(meta, nextScale, rotation % 180 !== 0, nextTranslate);
    }

    setIsInteracting(false); // allow the CSS transition to animate this snap
    setScale(nextScale);
    setTranslate(nextTranslate);
  };

  // Handles mouse dblclick (desktop) directly.
  const handleDoubleClick = (e) => {
    applyDoubleTap(e.clientX, e.clientY);
  };

  // ---------- Touch handlers ----------

  const getDistance = (touches) => {
    const [a, b] = touches;
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  };

  const getMidpoint = (touches) => {
    const [a, b] = touches;
    return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Starting (or resuming after a finger lift) a pinch: cancel any
      // in-flight single-finger drag and cache fresh geometry.
      dragStateRef.current = null;
      gestureMetaRef.current = measureGesture();
      pinchStateRef.current = { initialDistance: getDistance(e.touches), initialScale: scale };
      setIsInteracting(true);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();
      const dx = touch.clientX - lastTapRef.current.x;
      const dy = touch.clientY - lastTapRef.current.y;
      const isDoubleTap =
        now - lastTapRef.current.time < DOUBLE_TAP_DELAY && Math.hypot(dx, dy) < DOUBLE_TAP_MAX_DIST;

      if (isDoubleTap) {
        lastTapRef.current = { time: 0, x: 0, y: 0 }; // consume it, don't chain into a triple-tap
        applyDoubleTap(touch.clientX, touch.clientY);
        return;
      }
      lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };

      if (scale > 1) {
        gestureMetaRef.current = measureGesture();
        dragStateRef.current = { startX: touch.clientX - translate.x, startY: touch.clientY - translate.y };
        setIsInteracting(true);
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStateRef.current && gestureMetaRef.current) {
      e.preventDefault();
      const meta = gestureMetaRef.current;
      const newDistance = getDistance(e.touches);
      const midpoint = getMidpoint(e.touches);

      const nextScale = clamp(
        pinchStateRef.current.initialScale * (newDistance / pinchStateRef.current.initialDistance),
        MIN_SCALE,
        MAX_SCALE
      );

      const anchorX = midpoint.x - meta.stageCenterX;
      const anchorY = midpoint.y - meta.stageCenterY;
      // Anchor against THIS render's current scale/translate (not the
      // gesture's initial values) — this is what lets the formula absorb
      // the two-finger pan that naturally happens while pinching, instead
      // of only handling pure zoom.
const nextTranslate = zoomAround(anchorX, anchorY, scale, translate, nextScale);

scheduleFlush({ scale: nextScale, translate: nextTranslate });
    } else if (e.touches.length === 1 && dragStateRef.current && scale > 1 && gestureMetaRef.current) {
      e.preventDefault();
      const touch = e.touches[0];
      const raw = { x: touch.clientX - dragStateRef.current.startX, y: touch.clientY - dragStateRef.current.startY };
      const nextTranslate = clampTranslate(gestureMetaRef.current, scale, rotation % 180 !== 0, raw);
      scheduleFlush({ scale, translate: nextTranslate });
    }
  };

const handleTouchEnd = (e) => {
    pinchStateRef.current = null;
    dragStateRef.current = null;

    if (e.touches.length === 0) {
      setIsInteracting(false);
      if (scale <= MIN_SCALE + 0.001) {
        setScale(MIN_SCALE);
        setTranslate({ x: 0, y: 0 });
      } else if (gestureMetaRef.current) {
        const clamped = clampTranslate(gestureMetaRef.current, scale, rotation % 180 !== 0, translate);
        setTranslate(clamped);
      }
      gestureMetaRef.current = null;
    } else {
      gestureMetaRef.current = null;
    }
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
        ref={stageRef}
        className="img-preview__stage"
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={image.url}
          alt={image.alt || ''}
          className={`img-preview__image${isInteracting ? '' : ' img-preview__image--settled'}`}
          style={{
            transform: `translate3d(${translate.x}px, ${translate.y}px, 0) rotate(${rotation}deg) scale(${scale})`,
            maxWidth: isSideways ? '82vh' : '96vw',
            maxHeight: isSideways ? '96vw' : '82vh',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}