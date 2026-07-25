import { useEffect, useRef, useState, useCallback } from 'react';
import './ImageCropModal.css';
import Button from '../Button/Button';
import { rotateImageToCanvas, getRectCroppedImage } from '../../../utils/cropImage.js';

const HANDLE_HIT_RADIUS = 22; // touch-friendly grab radius, canvas px
const MIN_RECT_SIZE = 40;     // rectangle kabhi isse chhota nahi ho sakta

// Standard rectangle crop editor — 4 corner + 4 edge handles, drag body to
// move. Rectangle hamesha axis-aligned rehta hai (jaisa normal photo-editor
// crop tools mein hota hai). Same public interface: imageSrc, onConfirm(file), onCancel.
export default function ImageCropModal({ imageSrc, onConfirm, onCancel }) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);

  const [rotation, setRotation] = useState(0);
  const [naturalCanvas, setNaturalCanvas] = useState(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [rect, setRect] = useState(null); // { x, y, width, height } — display space
  const [isProcessing, setIsProcessing] = useState(false);

  const rectRef = useRef(null);
  const dragStateRef = useRef(null); // { mode: 'move'|'nw'|'n'|'ne'|'e'|'se'|'s'|'sw'|'w', startPointer, startRect }
  useEffect(() => {
    rectRef.current = rect;
  }, [rect]);

  // Load + rotate source image into a full-res offscreen canvas.
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setNaturalCanvas(rotateImageToCanvas(img, rotation));
    };
    img.src = imageSrc;
    return () => {
      cancelled = true;
    };
  }, [imageSrc, rotation]);

  // Fit the (rotated) image into the display canvas. Rect starts covering
  // the FULL image — exactly jaisa camera ne capture kiya, koi auto-crop
  // nahi. User khud handles drag karke jitna crop karna hai karega.
  useEffect(() => {
    if (!naturalCanvas || !stageRef.current) return;
    const maxW = Math.min(stageRef.current.clientWidth || 480, 480);
    const maxH = Math.min(window.innerHeight * 0.55, 520);
    const scale = Math.min(maxW / naturalCanvas.width, maxH / naturalCanvas.height, 1);
    const width = Math.max(1, Math.round(naturalCanvas.width * scale));
    const height = Math.max(1, Math.round(naturalCanvas.height * scale));

    setDisplaySize({ width, height });

    // Full-image rect — nothing cropped by default.
    setRect({
      x: 0,
      y: 0,
      width,
      height,
    });
  }, [naturalCanvas]);

  const getHandlePoints = useCallback((r) => {
    const { x, y, width, height } = r;
    const midX = x + width / 2;
    const midY = y + height / 2;
    return {
      nw: { x, y },
      n: { x: midX, y },
      ne: { x: x + width, y },
      e: { x: x + width, y: midY },
      se: { x: x + width, y: y + height },
      s: { x: midX, y: y + height },
      sw: { x, y: y + height },
      w: { x, y: midY },
    };
  }, []);

  // Redraw: base image (full, no dimming), rect outline, corner + edge handles
  // in the "bracket/square" style shown in the reference.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !naturalCanvas || !rect || displaySize.width === 0) return;

    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Poori image saaf dikhti hai — koi dark overlay nahi.
    ctx.drawImage(naturalCanvas, 0, 0, displaySize.width, displaySize.height);

    // Thin crop border.
    ctx.save();
    ctx.strokeStyle = '#7c5cff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();

    // Corner handles — small square brackets (L-shaped corner marks).
    const CORNER_SIZE = 14;
    const CORNER_THICKNESS = 3;
    const corners = getHandlePoints(rect);

    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = CORNER_THICKNESS;
    ctx.lineCap = 'round';

    const drawCornerBracket = (pt, dx, dy) => {
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y + dy * CORNER_SIZE);
      ctx.lineTo(pt.x, pt.y);
      ctx.lineTo(pt.x + dx * CORNER_SIZE, pt.y);
      ctx.stroke();
    };
    drawCornerBracket(corners.nw, 1, 1);
    drawCornerBracket(corners.ne, -1, 1);
    drawCornerBracket(corners.se, -1, -1);
    drawCornerBracket(corners.sw, 1, -1);
    ctx.restore();

    // Edge (mid-side) handles — small filled white rectangles.
    const EDGE_W = 16;
    const EDGE_H = 5;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;

    const drawEdgeHandle = (pt, horizontal) => {
      const w = horizontal ? EDGE_W : EDGE_H;
      const h = horizontal ? EDGE_H : EDGE_W;
      ctx.beginPath();
      ctx.roundRect(pt.x - w / 2, pt.y - h / 2, w, h, 2);
      ctx.fill();
      ctx.stroke();
    };
    drawEdgeHandle(corners.n, true);
    drawEdgeHandle(corners.s, true);
    drawEdgeHandle(corners.e, false);
    drawEdgeHandle(corners.w, false);
    ctx.restore();
  }, [naturalCanvas, rect, displaySize, getHandlePoints]);

  const getLocalPoint = useCallback((clientX, clientY) => {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    return { x: clientX - canvasRect.left, y: clientY - canvasRect.top };
  }, []);

  const detectDragMode = useCallback((pos, r) => {
    const handles = getHandlePoints(r);
    for (const [key, pt] of Object.entries(handles)) {
      if (Math.hypot(pt.x - pos.x, pt.y - pos.y) <= HANDLE_HIT_RADIUS) {
        return key;
      }
    }
    const insideBody =
      pos.x >= r.x && pos.x <= r.x + r.width && pos.y >= r.y && pos.y <= r.y + r.height;
    return insideBody ? 'move' : null;
  }, [getHandlePoints]);

  const startDrag = useCallback((pos) => {
    const r = rectRef.current;
    if (!r) return;
    const mode = detectDragMode(pos, r);
    if (!mode) return;
    dragStateRef.current = { mode, startPointer: pos, startRect: { ...r } };
  }, [detectDragMode]);

  const updateDrag = useCallback((pos) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const { mode, startPointer, startRect } = drag;
    const dx = pos.x - startPointer.x;
    const dy = pos.y - startPointer.y;
    const bounds = displaySize;

    let { x, y, width, height } = startRect;

    if (mode === 'move') {
      x = startRect.x + dx;
      y = startRect.y + dy;
      x = Math.min(Math.max(x, 0), bounds.width - width);
      y = Math.min(Math.max(y, 0), bounds.height - height);
    } else {
      // Resize — edges move independently, opposite edge stays fixed.
      let left = startRect.x;
      let top = startRect.y;
      let right = startRect.x + startRect.width;
      let bottom = startRect.y + startRect.height;

      if (mode.includes('w')) left = Math.min(Math.max(startRect.x + dx, 0), right - MIN_RECT_SIZE);
      if (mode.includes('e')) right = Math.max(Math.min(right + dx, bounds.width), left + MIN_RECT_SIZE);
      if (mode.includes('n')) top = Math.min(Math.max(startRect.y + dy, 0), bottom - MIN_RECT_SIZE);
      if (mode.includes('s')) bottom = Math.max(Math.min(bottom + dy, bounds.height), top + MIN_RECT_SIZE);

      x = left;
      y = top;
      width = right - left;
      height = bottom - top;
    }

    setRect({ x, y, width, height });
  }, [displaySize]);

  const endDrag = useCallback(() => {
    dragStateRef.current = null;
  }, []);

  // ---- Mouse ----
  const handleMouseDown = (e) => startDrag(getLocalPoint(e.clientX, e.clientY));
  const handleMouseMove = (e) => updateDrag(getLocalPoint(e.clientX, e.clientY));
  const handleMouseUp = () => endDrag();

  // ---- Touch: native listeners with {passive:false} so preventDefault
  // reliably blocks page scroll/zoom while dragging on mobile ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const onTouchStart = (e) => {
      const touch = e.touches[0];
      const pos = getLocalPoint(touch.clientX, touch.clientY);
      const r = rectRef.current;
      if (r && detectDragMode(pos, r)) {
        startDrag(pos);
        e.preventDefault();
      }
    };
    const onTouchMove = (e) => {
      if (!dragStateRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      updateDrag(getLocalPoint(touch.clientX, touch.clientY));
    };
    const onTouchEnd = () => endDrag();

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [getLocalPoint, detectDragMode, startDrag, updateDrag, endDrag]);

  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleConfirm = async () => {
    if (!naturalCanvas || !rect) return;
    setIsProcessing(true);
    try {
      const scaleX = naturalCanvas.width / displaySize.width;
      const scaleY = naturalCanvas.height / displaySize.height;
      const sourceRect = {
        x: rect.x * scaleX,
        y: rect.y * scaleY,
        width: rect.width * scaleX,
        height: rect.height * scaleY,
      };

      const blob = await getRectCroppedImage(naturalCanvas, sourceRect);
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onConfirm(file);
    } catch (err) {
      console.error('Crop failed:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="crop-modal__overlay" role="presentation">
      <div className="crop-modal" role="dialog" aria-modal="true" aria-label="Adjust photo before upload">
        <div className="crop-modal__header">
          <h2 className="crop-modal__title">Adjust Photo</h2>
          <p className="crop-modal__hint">Corners ya edges ko drag karke crop area set karo</p>
        </div>

        <div className="crop-modal__stage" ref={stageRef}>
          <canvas
            ref={canvasRef}
            className="crop-modal__canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        <div className="crop-modal__controls">
          <div className="crop-modal__control-row crop-modal__control-row--buttons">
            <button type="button" className="crop-modal__rotate-btn" onClick={handleRotate} aria-label="Rotate 90 degrees">
              ⟳ Rotate 90°
            </button>
          </div>
        </div>

        <div className="crop-modal__actions">
          <Button type="button" variant="primary" onClick={handleConfirm} loading={isProcessing} disabled={isProcessing || !rect}>
            Confirm
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}