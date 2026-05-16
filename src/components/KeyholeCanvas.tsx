import { useRef, useEffect, useCallback } from 'react';
import { ImageData, Settings, KeyholeRef } from '../types';
import { containFit } from '../render/fit';
import { compose, computeRevealTargetSize } from '../render/compose';
import { getBlurredBitmap, invalidateBlurCache } from '../render/blurCache';
import { usePointerInput } from '../hooks/usePointerInput';

interface Props {
  image: ImageData;
  settings: Settings;
  revealed: boolean;
  onRevealComplete: () => void;
  keyholeRef: React.RefObject<KeyholeRef>;
}

export function KeyholeCanvas({ image, settings, revealed, onRevealComplete, keyholeRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const blurBitmapRef = useRef<ImageBitmap | null>(null);
  const prevSettingsRef = useRef<Settings>(settings);
  const prevImageRef = useRef<ImageData>(image);

  usePointerInput(canvasRef, keyholeRef, revealed, settings.moveMode === 'hover');

  // Invalidate blur cache when image or blur settings change
  useEffect(() => {
    const settingsChanged =
      prevSettingsRef.current.background !== settings.background ||
      prevSettingsRef.current.blurRadius !== settings.blurRadius;
    const imageChanged = prevImageRef.current !== image;

    if (settingsChanged || imageChanged) {
      invalidateBlurCache();
      blurBitmapRef.current = null;
    }

    prevSettingsRef.current = settings;
    prevImageRef.current = image;
  }, [image, settings]);

  const startReveal = useCallback(() => {
    const kh = keyholeRef.current!;
    const canvas = canvasRef.current!;
    kh.revealOrigin = { ...kh.cursor };
    kh.revealFromSize = kh.size;
    kh.revealTargetSize = computeRevealTargetSize(
      kh.cursor.x,
      kh.cursor.y,
      canvas.width / (window.devicePixelRatio || 1),
      canvas.height / (window.devicePixelRatio || 1),
    );
    kh.revealStartedAt = performance.now();
    kh.revealing = true;
  }, [keyholeRef]);

  // Expose startReveal so parent can call it
  useEffect(() => {
    (keyholeRef as React.MutableRefObject<KeyholeRef & { startReveal?: () => void }>).current.startReveal = startReveal;
  }, [keyholeRef, startReveal]);

  useEffect(() => {
    const canvas = canvasRef.current!;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        invalidateBlurCache();
        blurBitmapRef.current = null;
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const ctx = canvas.getContext('2d')!;

    async function tick(now: number) {
      const dpr = window.devicePixelRatio || 1;
      const canvasW = canvas.width / dpr;
      const canvasH = canvas.height / dpr;
      const fit = containFit(image.naturalW, image.naturalH, canvasW, canvasH);

      ctx.save();
      ctx.scale(dpr, dpr);

      // Ensure blur bitmap is ready if needed
      if (settings.background === 'blur' && !blurBitmapRef.current) {
        try {
          blurBitmapRef.current = await getBlurredBitmap(image, fit, settings.blurRadius, canvasW, canvasH);
        } catch {
          // ignore — will retry next frame
        }
      }

      const kh = keyholeRef.current!;
      // Sync size from settings if not mid-reveal
      if (!kh.revealing) {
        // Only sync to settings size if user hasn't adjusted via wheel/key after init
      }

      const stillAnimating = compose(ctx, {
        image,
        fit,
        settings,
        keyhole: kh,
        revealed,
        canvasW,
        canvasH,
        blurredBitmap: blurBitmapRef.current,
        now,
      });

      ctx.restore();

      if (kh.revealing && !stillAnimating) {
        onRevealComplete();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [image, settings, revealed, onRevealComplete, keyholeRef]);

  return (
    <canvas
      ref={canvasRef}
      className="keyhole-canvas"
      style={{ touchAction: 'none', cursor: settings.moveMode === 'drag' ? 'crosshair' : 'none' }}
    />
  );
}

export function useStartReveal(keyholeRef: React.RefObject<KeyholeRef>) {
  return useCallback(() => {
    const kh = keyholeRef.current as KeyholeRef & { startReveal?: () => void };
    kh.startReveal?.();
  }, [keyholeRef]);
}
