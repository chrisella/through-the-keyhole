import { useState, useCallback } from 'react';
import { Settings } from '../types';
import { loadSettings, saveSettings, clearSettings, DEFAULT_SETTINGS } from '../lib/storage';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetDefaults = useCallback(() => {
    clearSettings();
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  return { settings, update, resetDefaults };
}
