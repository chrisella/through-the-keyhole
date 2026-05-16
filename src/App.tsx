import { useState, useRef, useCallback, useEffect } from 'react';
import { KeyholeRef } from './types';
import { useSettings } from './hooks/useSettings';
import { useImageLoader } from './hooks/useImageLoader';
import { useKeyboard } from './hooks/useKeyboard';
import { KeyholeCanvas, useStartReveal } from './components/KeyholeCanvas';
import { EmptyState } from './components/EmptyState';
import { SettingsPanel } from './components/SettingsPanel';
import { SettingsButton } from './components/SettingsButton';
import { TouchControls } from './components/TouchControls';
import { OnboardingTooltip } from './components/OnboardingTooltip';
import { isOnboardingDismissed } from './lib/storage';
import { DEFAULT_SETTINGS } from './lib/storage';
import { MIN_SIZE } from './render/shapes';

const DEFAULT_KEYHOLE: KeyholeRef = {
  cursor: { x: 0, y: 0 },
  size: DEFAULT_SETTINGS.size,
  revealing: false,
  revealStartedAt: null,
  revealFromSize: DEFAULT_SETTINGS.size,
  revealOrigin: { x: 0, y: 0 },
  revealTargetSize: 0,
};

const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export default function App() {
  const { settings, update, resetDefaults } = useSettings();
  const [revealed, setRevealed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDismissed());

  const keyholeRef = useRef<KeyholeRef>({ ...DEFAULT_KEYHOLE });

  // Sync keyholeRef.size from settings when settings change (unless user overrode via wheel/key)
  useEffect(() => {
    if (!keyholeRef.current.revealing) {
      keyholeRef.current.size = settings.size;
    }
  }, [settings.size]);

  const handleImageLoad = useCallback(() => {
    setRevealed(false);
    keyholeRef.current.revealing = false;
    keyholeRef.current.revealStartedAt = null;
  }, []);

  const { image, loadFromFile, clear } = useImageLoader(handleImageLoad);

  const startReveal = useStartReveal(keyholeRef);

  const handleReveal = useCallback(() => {
    if (!image) return;
    if (revealed) {
      setRevealed(false);
      keyholeRef.current.revealing = false;
      return;
    }
    startReveal();
  }, [image, revealed, startReveal]);

  const handleRevealComplete = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleReset = useCallback(() => {
    clear();
    setRevealed(false);
    keyholeRef.current = { ...DEFAULT_KEYHOLE, size: settings.size };
  }, [clear, settings.size]);

  const toggleSettings = useCallback(() => {
    setSettingsOpen(prev => !prev);
  }, []);

  const toggleHelp = useCallback(() => {
    setShowHelp(prev => !prev);
    if (!settingsOpen) setSettingsOpen(true);
  }, [settingsOpen]);

  // Keep keyhole size in sync when slider changes
  const handleSettingsUpdate = useCallback((patch: Partial<typeof settings>) => {
    update(patch);
    if (patch.size !== undefined && !keyholeRef.current.revealing) {
      keyholeRef.current.size = patch.size;
    }
  }, [update]);

  useKeyboard({
    keyholeRef,
    hasImage: !!image,
    revealed,
    onReveal: handleReveal,
    onToggleSettings: toggleSettings,
    onToggleHelp: toggleHelp,
  });

  // Centre keyhole when canvas first loads
  useEffect(() => {
    function onResize() {
      if (keyholeRef.current.cursor.x === 0 && keyholeRef.current.cursor.y === 0) {
        keyholeRef.current.cursor = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        };
      }
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Validate size min
  useEffect(() => {
    if (keyholeRef.current.size < MIN_SIZE) {
      keyholeRef.current.size = MIN_SIZE;
    }
  }, []);

  return (
    <div className="app">
      {image ? (
        <KeyholeCanvas
          image={image}
          settings={settings}
          revealed={revealed}
          onRevealComplete={handleRevealComplete}
          keyholeRef={keyholeRef}
        />
      ) : (
        <EmptyState onFile={loadFromFile} />
      )}

      <SettingsButton onClick={toggleSettings} open={settingsOpen} />

      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onUpdate={handleSettingsUpdate}
        onReset={resetDefaults}
        showHelp={showHelp}
        onToggleHelp={toggleHelp}
      />

      {settingsOpen && (
        <div className="settings-backdrop" onClick={toggleSettings} />
      )}

      {isTouch && image && (
        <TouchControls
          hasImage={!!image}
          revealed={revealed}
          onReveal={handleReveal}
          onReset={handleReset}
        />
      )}

      {showOnboarding && (
        <OnboardingTooltip onDismiss={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
