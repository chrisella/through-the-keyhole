import { describe, it, expect } from 'vitest';
import { easeOutCubic, clamp, lerp } from '../lib/easing';

describe('easeOutCubic', () => {
  it('returns 0 at t=0', () => expect(easeOutCubic(0)).toBe(0));
  it('returns 1 at t=1', () => expect(easeOutCubic(1)).toBe(1));
  it('is monotonically increasing', () => {
    for (let i = 0; i < 99; i++) {
      expect(easeOutCubic((i + 1) / 100)).toBeGreaterThan(easeOutCubic(i / 100));
    }
  });
});

describe('clamp', () => {
  it('clamps below min', () => expect(clamp(-5, 0, 10)).toBe(0));
  it('clamps above max', () => expect(clamp(15, 0, 10)).toBe(10));
  it('passes through value in range', () => expect(clamp(5, 0, 10)).toBe(5));
});

describe('lerp', () => {
  it('returns a at t=0', () => expect(lerp(10, 20, 0)).toBe(10));
  it('returns b at t=1', () => expect(lerp(10, 20, 1)).toBe(20));
  it('returns midpoint at t=0.5', () => expect(lerp(10, 20, 0.5)).toBe(15));
});
