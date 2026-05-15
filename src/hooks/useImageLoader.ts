import { useState, useEffect, useCallback } from 'react';
import { ImageData } from '../types';
import { loadImageFromBlob } from '../lib/downscale';

export function useImageLoader(onLoad: () => void) {
  const [image, setImage] = useState<ImageData | null>(null);

  const loadFromBlob = useCallback(async (blob: Blob) => {
    try {
      const data = await loadImageFromBlob(blob);
      setImage(data);
      onLoad();
    } catch (err) {
      console.error('Failed to load image:', err);
    }
  }, [onLoad]);

  const loadFromFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    loadFromBlob(file);
  }, [loadFromBlob]);

  const clear = useCallback(() => {
    setImage(prev => {
      prev?.bitmap.close();
      return null;
    });
  }, []);

  // Global drag-and-drop
  useEffect(() => {
    const onDragOver = (e: DragEvent) => e.preventDefault();
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files[0];
      if (file) loadFromFile(file);
    };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [loadFromFile]);

  // Global paste
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) loadFromFile(file);
          break;
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [loadFromFile]);

  return { image, loadFromFile, loadFromBlob, clear };
}
