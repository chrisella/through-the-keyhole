import { Shape } from '../types';

export const KEYHOLE_GEOMETRY = {
  circleOffsetY: -0.25,
  stemHalfWidth: 0.45,
  stemBottom: 1.6,
  arcStartDeg: 210,
  arcEndDeg: 330,
} as const;

export const MIN_SIZE = 20;
export const MAX_SIZE = 400;

export function buildShapePath(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  cx: number,
  cy: number,
  size: number,
): void {
  ctx.beginPath();
  switch (shape) {
    case 'circle':
      buildCircle(ctx, cx, cy, size);
      break;
    case 'rect':
      buildRect(ctx, cx, cy, size);
      break;
    case 'keyhole':
      buildKeyhole(ctx, cx, cy, size);
      break;
    case 'star':
      buildStar(ctx, cx, cy, size);
      break;
  }
}

function buildCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  ctx.arc(cx, cy, size, 0, Math.PI * 2);
}

function buildRect(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  ctx.rect(cx - size, cy - size, size * 2, size * 2);
}

function buildKeyhole(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  const g = KEYHOLE_GEOMETRY;
  const circleCY = cy + size * g.circleOffsetY;
  const startRad = (g.arcStartDeg * Math.PI) / 180;
  const endRad = (g.arcEndDeg * Math.PI) / 180;

  // Start at the arc-start point on the circle
  const startX = cx + size * Math.cos(startRad);
  const startY = circleCY + size * Math.sin(startRad);

  ctx.moveTo(startX, startY);

  // Arc clockwise from 210° to 330° (the top open arc)
  ctx.arc(cx, circleCY, size, startRad, endRad);

  // Right side of stem going down
  ctx.lineTo(cx + size * g.stemHalfWidth, cy + size * g.stemBottom);

  // Bottom of stem
  ctx.lineTo(cx - size * g.stemHalfWidth, cy + size * g.stemBottom);

  ctx.closePath();
}

function buildStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  const outerR = size;
  const innerR = size * 0.4;
  const points = 5;
  const startAngle = -Math.PI / 2;

  for (let i = 0; i < points * 2; i++) {
    const angle = startAngle + (i * Math.PI) / points;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
