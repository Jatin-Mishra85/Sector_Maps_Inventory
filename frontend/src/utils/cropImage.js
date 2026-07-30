// Simple rectangle crop utility — image ko rotate karke full-res offscreen
// canvas mein rakhta hai, aur diye gaye rectangle (display-space se
// source-space mein scale karke) ko seedha canvas.drawImage() se crop
// karke final JPEG blob deta hai. Koi perspective warp nahi — sirf
// standard axis-aligned rectangle crop.

// Rotates a loaded <img> by 0/90/180/270 into a fresh full-res offscreen canvas.
export function rotateImageToCanvas(img, rotationDeg) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const rad = (rotationDeg * Math.PI) / 180;

  if (rotationDeg % 180 === 0) {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
  } else {
    canvas.width = img.naturalHeight;
    canvas.height = img.naturalWidth;
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return canvas;
}

// sourceCanvas: full-res (already rotated) offscreen canvas.
// rect: { x, y, width, height } in sourceCanvas's own pixel coordinates.
// Returns Promise<Blob> (JPEG).
export async function getRectCroppedImage(sourceCanvas, rect, maxOutputDim = Infinity, quality = 0.8) {
  const cropW = Math.max(1, Math.round(rect.width));
  const cropH = Math.max(1, Math.round(rect.height));

  const scale = Math.min(1, maxOutputDim / Math.max(cropW, cropH));
  const outW = Math.max(1, Math.round(cropW * scale));
  const outH = Math.max(1, Math.round(cropH * scale));

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;
  const ctx = outCanvas.getContext('2d');

  ctx.drawImage(
    sourceCanvas,
    Math.round(rect.x), Math.round(rect.y), cropW, cropH,
    0, 0, outW, outH
  );

  return new Promise((resolve, reject) => {
    outCanvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      quality   // ✅ ab configurable — 0.8 = 80% quality, kaafi zyada hai
    );
  });
}