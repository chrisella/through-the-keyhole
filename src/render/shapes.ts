import { Shape } from '../types';

export const KEYHOLE_GEOMETRY = {
  // Circle center is above the anchor point
  circleOffsetY: -0.3,
  // Degrees from straight-down (90°) to the open slot edges — 25° each side = 50° total opening
  openHalfDeg: 25,
  // Stem width at the bottom, widens from the circle opening
  stemBottomHalfWidth: 0.5,
  stemBottom: 1.3,
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

  // Angles where the stem meets the circle (measured from positive x-axis, clockwise in canvas)
  // Straight down = 90°; we open by ±openHalfDeg from there
  const downRad = Math.PI / 2;
  const openHalfRad = (g.openHalfDeg * Math.PI) / 180;
  const rightJoinAngle = downRad - openHalfRad; // e.g. 65°
  const leftJoinAngle  = downRad + openHalfRad; // e.g. 115°

  // Start point: right side where circle meets stem
  const rightJoinX = cx + size * Math.cos(rightJoinAngle);
  const rightJoinY = circleCY + size * Math.sin(rightJoinAngle);

  // Stem bottom (wider than the circle opening)
  const stemBottomY = cy + size * g.stemBottom;

  ctx.moveTo(rightJoinX, rightJoinY);

  // Large arc ANTICLOCKWISE from rightJoin → over the top → leftJoin (the 310° arc)
  ctx.arc(cx, circleCY, size, rightJoinAngle, leftJoinAngle, true);

  // Left side of stem going down-left to the wider base
  ctx.lineTo(cx - size * g.stemBottomHalfWidth, stemBottomY);

  // Bottom of stem
  ctx.lineTo(cx + size * g.stemBottomHalfWidth, stemBottomY);

  // closePath draws the right side back up to rightJoinX/Y
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
