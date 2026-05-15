import { ImageData } from '../types';

const MAX_W = 2560;
const MAX_H = 1600;

export async function loadImageFromBlob(blob: Blob): Promise<ImageData> {
  const bitmap = await createImageBitmap(blob);
  const { width, height } = bitmap;

  if (width <= MAX_W && height <= MAX_H) {
    return { bitmap, naturalW: width, naturalH: height };
  }

  const scale = Math.min(MAX_W / width, MAX_H / height);
  const scaledW = Math.round(width * scale);
  const scaledH = Math.round(height * scale);

  const offscreen = new OffscreenCanvas(scaledW, scaledH);
  const ctx = offscreen.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, scaledW, scaledH);
  bitmap.close();

  const scaledBitmap = await createImageBitmap(offscreen);
  return { bitmap: scaledBitmap, naturalW: scaledW, naturalH: scaledH };
}
