import { useEffect } from 'react';
import { KeyholeRef } from '../types';
import { clamp } from '../lib/easing';
import { MIN_SIZE, MAX_SIZE } from '../render/shapes';
import { RefObject } from 'react';

const SIZE_KEY_STEP = 10;

interface UseKeyboardOptions {
  keyholeRef: RefObject<KeyholeRef>;
  hasImage: boolean;
  revealed: boolean;
  onReveal: () => void;
  onToggleSettings: () => void;
  onToggleHelp: () => void;
}

export function useKeyboard({
  keyholeRef,
  hasImage,
  revealed,
  onReveal,
  onToggleSettings,
  onToggleHelp,
}: UseKeyboardOptions) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't steal keys when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const kh = keyholeRef.current!;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (!e.repeat && hasImage) onReveal();
          break;
        case '+':
        case '=':
          e.preventDefault();
          kh.size = clamp(kh.size + SIZE_KEY_STEP, MIN_SIZE, MAX_SIZE);
          break;
        case '-':
        case '_':
          e.preventDefault();
          kh.size = clamp(kh.size - SIZE_KEY_STEP, MIN_SIZE, MAX_SIZE);
          break;
        case 'Escape':
          onToggleSettings();
          break;
        case '?':
          onToggleHelp();
          break;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [keyholeRef, hasImage, revealed, onReveal, onToggleSettings, onToggleHelp]);
}
