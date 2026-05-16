import { Settings, ImageData, FitRect, KeyholeRef } from '../types';
import { buildShapePath } from './shapes';
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

export function computeRevealTargetSize(originX: number, originY: number, canvasW: number, canvasH: number): number {
  const corners = [
    { x: 0, y: 0 },
    { x: canvasW, y: 0 },
    { x: 0, y: canvasH },
    { x: canvasW, y: canvasH },
  ];
  const maxDist = Math.max(...corners.map(c => Math.hypot(c.x - originX, c.y - originY)));
  return maxDist * 1.5;
}
