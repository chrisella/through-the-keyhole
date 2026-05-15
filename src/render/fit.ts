import { FitRect } from '../types';

export function containFit(imgW: number, imgH: number, canvasW: number, canvasH: number): FitRect {
  if (imgW === 0 || imgH === 0 || canvasW === 0 || canvasH === 0) {
    return { dx: 0, dy: 0, dw: canvasW, dh: canvasH };
  }
  const scale = Math.min(canvasW / imgW, canvasH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const dx = (canvasW - dw) / 2;
  const dy = (canvasH - dh) / 2;
  return { dx, dy, dw, dh };
}
