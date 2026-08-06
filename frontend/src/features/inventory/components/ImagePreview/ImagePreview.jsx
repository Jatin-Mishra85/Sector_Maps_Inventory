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
const MOMENTUM_FRICTION = 0.92; // per-frame velocity decay — lower = stops faster
const MOMENTUM_MIN_VELOCITY = 0.04; // px/ms — below this, don't bother with momentum at all
const MOMENTUM_STOP_VELOCITY = 0.5; // px/frame — below this, momentum animation stops

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

  // Tracks recent single-finger drag position/time to compute release velocity for momentum.
  const velocityRef = useRef({ vx: 0, vy: 0, lastX: 0, lastY: 0, lastT: 0 });
  const momentumRafRef = useRef(null); // separate rAF loop from `rafRef` (gesture flush loop)

  // Live transform during an active gesture. Direct DOM writes go here so
  // 60fps touchmove doesn't wait on a React re-render every frame — that
  // render lag was the actual cause of the roughness. React state (scale/
  // translate) is synced from this ref only at gesture END.
  const liveTransformRef = useRef({ scale: 1, translate: { x: 0, y: 0 } });
const resetView = useCallback(() => {
    liveTransformRef.current = { scale: 1, translate: { x: 0, y: 0 } };
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
      liveTransformRef.current = pending;
      const img = imageRef.current;
      if (img) {
        img.style.transform = `translate3d(${pending.translate.x}px, ${pending.translate.y}px, 0) rotate(${rotation}deg) scale(${pending.scale})`;
      }
    });
  };
// Post-release inertia: decelerates the pan using the velocity captured at
  // finger-lift, clamping to bounds each frame so it never overshoots past
  // where a drag would've stopped anyway.
  const startMomentum = (initialTranslate, vx, vy, scaleValue, rotated, meta) => {
    let velX = vx * 16; // px/ms -> approx px/frame at 60fps
    let velY = vy * 16;
    let current = { ...initialTranslate };

    const step = () => {
      velX *= MOMENTUM_FRICTION;
      velY *= MOMENTUM_FRICTION;
      current = { x: current.x + velX, y: current.y + velY };

      const bounds = getBounds(meta, scaleValue, rotated);
      if (current.x < bounds.minX) { current.x = bounds.minX; velX = 0; }
      else if (current.x > bounds.maxX) { current.x = bounds.maxX; velX = 0; }
      if (current.y < bounds.minY) { current.y = bounds.minY; velY = 0; }
      else if (current.y > bounds.maxY) { current.y = bounds.maxY; velY = 0; }

      liveTransformRef.current = { scale: scaleValue, translate: current };
      const img = imageRef.current;
      if (img) {
        img.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) rotate(${rotation}deg) scale(${scaleValue})`;
      }

      if (Math.abs(velX) < MOMENTUM_STOP_VELOCITY && Math.abs(velY) < MOMENTUM_STOP_VELOCITY) {
        momentumRafRef.current = null;
        setTranslate(current); // final sync to React state once settled
        return;
      }
      momentumRafRef.current = requestAnimationFrame(step);
    };

    momentumRafRef.current = requestAnimationFrame(step);
  };
useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    if (momentumRafRef.current != null) cancelAnimationFrame(momentumRafRef.current);
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
liveTransformRef.current = { scale: nextScale, translate: nextTranslate };
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
    // Any new touch interrupts an in-flight momentum animation.
    if (momentumRafRef.current != null) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }

    if (e.touches.length === 2) {
      // Starting (or resuming after a finger lift) a pinch: cancel any
      // in-flight single-finger drag and cache fresh geometry.
      dragStateRef.current = null;
      gestureMetaRef.current = measureGesture();
      pinchStateRef.current = { initialDistance: getDistance(e.touches), initialScale: liveTransformRef.current.scale };
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

const { scale: liveScale, translate: liveTranslate } = liveTransformRef.current;
      if (liveScale > 1) {
        gestureMetaRef.current = measureGesture();
        dragStateRef.current = { startX: touch.clientX - liveTranslate.x, startY: touch.clientY - liveTranslate.y };
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
      const { scale: curScale, translate: curTranslate } = liveTransformRef.current;
      const nextTranslate = zoomAround(anchorX, anchorY, curScale, curTranslate, nextScale);

      scheduleFlush({ scale: nextScale, translate: nextTranslate });
    } else if (e.touches.length === 1 && dragStateRef.current && gestureMetaRef.current) {
      const curScale = liveTransformRef.current.scale;
      if (curScale <= 1) return;
      e.preventDefault();
      const touch = e.touches[0];
      const raw = { x: touch.clientX - dragStateRef.current.startX, y: touch.clientY - dragStateRef.current.startY };
      const nextTranslate = clampTranslate(gestureMetaRef.current, curScale, rotation % 180 !== 0, raw);
      scheduleFlush({ scale: curScale, translate: nextTranslate });

      const now = performance.now();
      const dt = now - velocityRef.current.lastT;
      if (dt > 0) {
        velocityRef.current.vx = (touch.clientX - velocityRef.current.lastX) / dt;
        velocityRef.current.vy = (touch.clientY - velocityRef.current.lastY) / dt;
      }
      velocityRef.current.lastX = touch.clientX;
      velocityRef.current.lastY = touch.clientY;
      velocityRef.current.lastT = now;
    }
  };

const handleTouchEnd = (e) => {
    if (e.touches.length >= 2) {
      // 3rd finger jaisi rare cases — fresh pinch start jaisa treat karo
      pinchStateRef.current = { initialDistance: getDistance(e.touches), initialScale: liveTransformRef.current.scale };
      gestureMetaRef.current = measureGesture();
      dragStateRef.current = null;
      return;
    }

   if (e.touches.length === 1) {
      pinchStateRef.current = null;
      const touch = e.touches[0];
      gestureMetaRef.current = measureGesture();
      const { scale: curScale, translate: curTranslate } = liveTransformRef.current;
      dragStateRef.current =
        curScale > 1 ? { startX: touch.clientX - curTranslate.x, startY: touch.clientY - curTranslate.y } : null;
      if (dragStateRef.current) {
        velocityRef.current = { vx: 0, vy: 0, lastX: touch.clientX, lastY: touch.clientY, lastT: performance.now() };
      }
      return;
    }
    

    // e.touches.length === 0 — gesture pura khatam
   pinchStateRef.current = null;
    const wasDragging = dragStateRef.current != null;
    dragStateRef.current = null;
    setIsInteracting(false);
    const { scale: curScale, translate: curTranslate } = liveTransformRef.current;

    if (curScale <= MIN_SCALE + 0.001) {
      liveTransformRef.current = { scale: MIN_SCALE, translate: { x: 0, y: 0 } };
      setScale(MIN_SCALE);
      setTranslate({ x: 0, y: 0 });
    } else {
      const meta = gestureMetaRef.current || measureGesture();
      const clamped = meta ? clampTranslate(meta, curScale, rotation % 180 !== 0, curTranslate) : curTranslate;
      liveTransformRef.current = { scale: curScale, translate: clamped };
      setScale(curScale);

      const { vx, vy } = velocityRef.current;
      const hasMomentum = wasDragging && meta && (Math.abs(vx) > MOMENTUM_MIN_VELOCITY || Math.abs(vy) > MOMENTUM_MIN_VELOCITY);
      if (hasMomentum) {
        startMomentum(clamped, vx, vy, curScale, rotation % 180 !== 0, meta);
      } else {
        setTranslate(clamped);
      }
    }
    gestureMetaRef.current = null;
    velocityRef.current = { vx: 0, vy: 0, lastX: 0, lastY: 0, lastT: 0 };
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