import { describe, it, expect, beforeEach } from 'vitest';
import { loadSettings, saveSettings, clearSettings, DEFAULT_SETTINGS } from '../lib/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('loadSettings', () => {
  it('returns defaults when localStorage is empty', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('returns defaults when localStorage contains corrupt JSON', () => {
    localStorage.setItem('ttk_settings', 'not-json{{{');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('returns defaults when version does not match', () => {
    localStorage.setItem('ttk_settings', JSON.stringify({ version: 99, data: { shape: 'circle' } }));
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('returns merged settings when valid', () => {
    saveSettings({ ...DEFAULT_SETTINGS, shape: 'star', size: 120 });
    const result = loadSettings();
    expect(result.shape).toBe('star');
    expect(result.size).toBe(120);
  });
});

describe('saveSettings / round-trip', () => {
  it('round-trips all settings fields', () => {
    const custom = { ...DEFAULT_SETTINGS, shape: 'circle' as const, size: 200, blurRadius: 40 };
    saveSettings(custom);
    expect(loadSettings()).toEqual(custom);
  });
});

describe('clearSettings', () => {
  it('returns defaults after clearing', () => {
    saveSettings({ ...DEFAULT_SETTINGS, shape: 'star' as const });
    clearSettings();
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
