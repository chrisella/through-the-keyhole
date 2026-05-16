import { useEffect, RefObject } from 'react';
import { KeyholeRef } from '../types';
import { clamp } from '../lib/easing';
import { MIN_SIZE, MAX_SIZE } from '../render/shapes';

const SIZE_WHEEL_STEP = 0.1;

interface ActivePointer {
  x: number;
  y: number;
}

export function usePointerInput(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  keyholeRef: RefObject<KeyholeRef>,
  revealed: boolean,
  followHover: boolean,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const active = new Map<number, ActivePointer>();
    let pinchInitialDist = 0;
    let pinchInitialSize = 0;

    function getCanvasPoint(e: PointerEvent): { x: number; y: number } {
      const rect = canvas!.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    function getPinchDist(): number {
      const pts = [...active.values()];
      if (pts.length < 2) return 0;
      return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    }

    function onPointerDown(e: PointerEvent) {
      canvas!.setPointerCapture(e.pointerId);
      const pt = getCanvasPoint(e);
      active.set(e.pointerId, pt);

      if (active.size === 2) {
        pinchInitialDist = getPinchDist();
        pinchInitialSize = keyholeRef.current!.size;
      } else if (active.size === 1 && keyholeRef.current) {
        keyholeRef.current.cursor = pt;
      }
    }

    function onPointerMove(e: PointerEvent) {
      const kh = keyholeRef.current!;

      // Mouse hover mode: follow cursor without a button held down
      if (followHover && e.pointerType === 'mouse' && !active.has(e.pointerId)) {
        kh.cursor = getCanvasPoint(e);
        return;
      }

      if (!active.has(e.pointerId)) return;
      const pt = getCanvasPoint(e);
      active.set(e.pointerId, pt);

      if (active.size === 1) {
        kh.cursor = pt;
      } else if (active.size === 2 && pinchInitialDist > 0) {
        const dist = getPinchDist();
        const newSize = pinchInitialSize * (dist / pinchInitialDist);
        kh.size = clamp(newSize, MIN_SIZE, MAX_SIZE);
      }
    }

    function onPointerUp(e: PointerEvent) {
      active.delete(e.pointerId);
      if (active.size < 2) {
        pinchInitialDist = 0;
      }
      if (active.size === 1) {
        // Re-baseline pinch when going from 2→1 then adding a new pointer later
        pinchInitialDist = 0;
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (revealed) return;
      const kh = keyholeRef.current!;
      kh.size = clamp(kh.size + -e.deltaY * SIZE_WHEEL_STEP, MIN_SIZE, MAX_SIZE);
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [canvasRef, keyholeRef, revealed, followHover]);
}
