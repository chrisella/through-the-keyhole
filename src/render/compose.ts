import { Settings, ImageData, FitRect, KeyholeRef, Shape } from '../types';
import { buildShapePath, KEYHOLE_GEOMETRY } from './shapes';
import { easeOutCubic, easeInCubic, clamp, lerp } from '../lib/easing';


export interface ComposeFrame {
  image: ImageData;
  fit: FitRect;
  settings: Settings;
  keyhole: KeyholeRef;
  revealed: boolean;
  canvasW: number;
  canvasH: number;
  blurredBitmap: ImageBitmap | null;
  now: number;
}

export function compose(ctx: CanvasRenderingContext2D, frame: ComposeFrame): boolean {
  const { image, fit, settings, keyhole, revealed, canvasW, canvasH, blurredBitmap, now } = frame;

  ctx.clearRect(0, 0, canvasW, canvasH);

  // Draw background
  switch (settings.background) {
    case 'black':
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvasW, canvasH);
      break;
    case 'color':
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
      break;
    case 'blur':
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvasW, canvasH);
      if (blurredBitmap) {
        ctx.drawImage(blurredBitmap, 0, 0);
      }
      break;
  }

  if (revealed) {
    ctx.drawImage(image.bitmap, fit.dx, fit.dy, fit.dw, fit.dh);
    return false;
  }

  // Determine current size (possibly animating)
  let currentSize = keyhole.size;
  let cx = keyhole.cursor.x;
  let cy = keyhole.cursor.y;
  let animating = false;

  if (keyhole.revealing && keyhole.revealStartedAt !== null) {
    const elapsed = now - keyhole.revealStartedAt;
    const t = clamp(elapsed / settings.revealDuration, 0, 1);
    currentSize = lerp(keyhole.revealFromSize, keyhole.revealTargetSize, easeOutCubic(t));
    cx = keyhole.revealOrigin.x;
    cy = keyhole.revealOrigin.y;
    animating = t < 1;
    if (!animating) {
      keyhole.revealing = false;
    }
  } else if (keyhole.unrevealing && keyhole.unrevealStartedAt !== null) {
    const elapsed = now - keyhole.unrevealStartedAt;
    const t = clamp(elapsed / settings.revealDuration, 0, 1);
    currentSize = lerp(keyhole.revealTargetSize, keyhole.size, easeInCubic(t));
    cx = keyhole.revealOrigin.x;
    cy = keyhole.revealOrigin.y;
    if (t >= 1) keyhole.unrevealing = false;
  }

  // Clip to keyhole shape and draw image
  ctx.save();
  buildShapePath(ctx, settings.shape, cx, cy, currentSize);
  ctx.clip();
  ctx.drawImage(image.bitmap, fit.dx, fit.dy, fit.dw, fit.dh);
  ctx.restore();

  return keyhole.revealing;
}

export function computeRevealTargetSize(
  shape: Shape,
  originX: number,
  originY: number,
  canvasW: number,
  canvasH: number,
): number {
  const corners = [
    { x: 0, y: 0 },
    { x: canvasW, y: 0 },
    { x: 0, y: canvasH },
    { x: canvasW, y: canvasH },
  ];

  if (shape === 'rect') {
    // Rect is (cx±size, cy±size) — covered when size >= max axis distance to any edge
    return Math.max(originX, canvasW - originX, originY, canvasH - originY) * 1.01;
  }

  if (shape === 'keyhole') {
    // Circle center sits at (originX, originY + offset*size). Solve per corner for minimum size:
    // (1 - offset²)·size² + 2·offset·dy·size − d² ≥ 0
    const offset = KEYHOLE_GEOMETRY.circleOffsetY; // −0.3
    const a = 1 - offset * offset; // 0.91
    let maxSize = 0;
    for (const c of corners) {
      const dx = c.x - originX;
      const dy = c.y - originY;
      const d2 = dx * dx + dy * dy;
      const b = 2 * offset * dy;
      const size = (-b + Math.sqrt(b * b + 4 * a * d2)) / (2 * a);
      maxSize = Math.max(maxSize, size);
    }
    return maxSize * 1.01;
  }

  // Circle and star: radius 'size' centred at origin
  const maxDist = Math.max(...corners.map(c => Math.hypot(c.x - originX, c.y - originY)));
  return maxDist * 1.01;
}
