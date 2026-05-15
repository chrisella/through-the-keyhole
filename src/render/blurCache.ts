import { ImageData, FitRect } from '../types';

interface CacheEntry {
  bitmap: ImageBitmap;
  imageKey: ImageBitmap;
  blurRadius: number;
  canvasW: number;
  canvasH: number;
}

let cache: CacheEntry | null = null;

export async function getBlurredBitmap(
  imageData: ImageData,
  fit: FitRect,
  blurRadius: number,
  canvasW: number,
  canvasH: number,
): Promise<ImageBitmap> {
  if (
    cache &&
    cache.imageKey === imageData.bitmap &&
    cache.blurRadius === blurRadius &&
    cache.canvasW === canvasW &&
    cache.canvasH === canvasH
  ) {
    return cache.bitmap;
  }

  if (cache) {
    cache.bitmap.close();
    cache = null;
  }

  const offscreen = new OffscreenCanvas(canvasW, canvasH);
  const ctx = offscreen.getContext('2d')!;

  ctx.filter = `blur(${blurRadius}px)`;
  ctx.drawImage(imageData.bitmap, fit.dx, fit.dy, fit.dw, fit.dh);
  ctx.filter = 'none';

  const bitmap = await createImageBitmap(offscreen);
  cache = { bitmap, imageKey: imageData.bitmap, blurRadius, canvasW, canvasH };
  return bitmap;
}

export function invalidateBlurCache(): void {
  if (cache) {
    cache.bitmap.close();
    cache = null;
  }
}
