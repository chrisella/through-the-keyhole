export type Shape = 'keyhole' | 'circle' | 'rect' | 'star';
export type BackgroundMode = 'black' | 'color' | 'blur';
export type MoveMode = 'hover' | 'drag';

export interface Settings {
  shape: Shape;
  size: number;
  background: BackgroundMode;
  backgroundColor: string;
  blurRadius: number;
  moveMode: MoveMode;
  revealDuration: number;
  edgeBlur: number;
}

export interface ImageData {
  bitmap: ImageBitmap;
  naturalW: number;
  naturalH: number;
}

export interface FitRect {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface KeyholeRef {
  cursor: Point;
  size: number;
  revealing: boolean;
  revealStartedAt: number | null;
  revealFromSize: number;
  revealOrigin: Point;
  revealTargetSize: number;
  unrevealing: boolean;
  unrevealStartedAt: number | null;
}
