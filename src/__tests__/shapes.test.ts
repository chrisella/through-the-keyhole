import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildShapePath } from '../render/shapes';

function makeMockCtx() {
  const calls: string[] = [];
  const ctx = {
    beginPath: vi.fn(() => calls.push('beginPath')),
    arc: vi.fn((...args: number[]) => calls.push(`arc(${args.join(',')})`)),
    rect: vi.fn((...args: number[]) => calls.push(`rect(${args.join(',')})`)),
    moveTo: vi.fn((...args: number[]) => calls.push(`moveTo(${args.map(n => n.toFixed(2)).join(',')})`)),
    lineTo: vi.fn((...args: number[]) => calls.push(`lineTo(${args.map(n => n.toFixed(2)).join(',')})`)),
    closePath: vi.fn(() => calls.push('closePath')),
    _calls: calls,
  };
  return ctx as unknown as CanvasRenderingContext2D & { _calls: string[] };
}

beforeEach(() => vi.clearAllMocks());

describe('buildShapePath - circle', () => {
  it('calls arc with correct centre and radius', () => {
    const ctx = makeMockCtx();
    buildShapePath(ctx, 'circle', 100, 150, 50);
    expect(ctx.arc).toHaveBeenCalledWith(100, 150, 50, 0, Math.PI * 2);
  });
});

describe('buildShapePath - rect', () => {
  it('draws a centred square of size*2', () => {
    const ctx = makeMockCtx();
    buildShapePath(ctx, 'rect', 100, 100, 40);
    expect(ctx.rect).toHaveBeenCalledWith(60, 60, 80, 80);
  });
});

describe('buildShapePath - star', () => {
  it('generates 10 vertices alternating outer/inner radii', () => {
    const ctx = makeMockCtx() as unknown as CanvasRenderingContext2D & {
      _calls: string[];
      moveTo: ReturnType<typeof vi.fn>;
      lineTo: ReturnType<typeof vi.fn>;
    };
    buildShapePath(ctx, 'star', 0, 0, 100);
    // 1 moveTo + 9 lineTo + 1 closePath
    const moveCount = ctx.moveTo.mock.calls.length;
    const lineCount = ctx.lineTo.mock.calls.length;
    expect(moveCount).toBe(1);
    expect(lineCount).toBe(9);

    const outerR = 100;
    const innerR = 40;
    const allPoints = [ctx.moveTo.mock.calls[0], ...ctx.lineTo.mock.calls];
    for (let i = 0; i < allPoints.length; i++) {
      const [x, y] = allPoints[i] as [number, number];
      const dist = Math.hypot(x, y);
      const expectedR = i % 2 === 0 ? outerR : innerR;
      expect(dist).toBeCloseTo(expectedR, 5);
    }
  });
});

describe('buildShapePath - keyhole', () => {
  it('closes the path', () => {
    const ctx = makeMockCtx();
    buildShapePath(ctx, 'keyhole', 100, 100, 60);
    expect(ctx.closePath).toHaveBeenCalled();
  });

  it('includes an arc call for the top circle', () => {
    const ctx = makeMockCtx();
    buildShapePath(ctx, 'keyhole', 100, 100, 60);
    expect(ctx.arc).toHaveBeenCalled();
  });
});
