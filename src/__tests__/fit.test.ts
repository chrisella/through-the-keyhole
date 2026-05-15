import { describe, it, expect } from 'vitest';
import { containFit } from '../render/fit';

describe('containFit', () => {
  it('fits square image in landscape canvas with letterbox top/bottom', () => {
    const result = containFit(100, 100, 200, 100);
    expect(result.dw).toBe(100);
    expect(result.dh).toBe(100);
    expect(result.dx).toBe(50);
    expect(result.dy).toBe(0);
  });

  it('fits landscape image in portrait canvas with letterbox sides', () => {
    const result = containFit(200, 100, 100, 200);
    expect(result.dw).toBe(100);
    expect(result.dh).toBe(50);
    expect(result.dx).toBe(0);
    expect(result.dy).toBe(75);
  });

  it('fits exact match with no letterbox', () => {
    const result = containFit(800, 600, 800, 600);
    expect(result.dx).toBe(0);
    expect(result.dy).toBe(0);
    expect(result.dw).toBe(800);
    expect(result.dh).toBe(600);
  });

  it('handles zero canvas dimensions gracefully', () => {
    const result = containFit(100, 100, 0, 0);
    expect(result.dw).toBe(0);
    expect(result.dh).toBe(0);
  });

  it('scales down a large image to fit', () => {
    const result = containFit(4000, 2000, 800, 400);
    expect(result.dw).toBeCloseTo(800);
    expect(result.dh).toBeCloseTo(400);
  });
});
