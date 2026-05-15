import { Settings } from '../types';

const STORAGE_KEY = 'ttk_settings';
const STORAGE_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  shape: 'keyhole',
  size: 80,
  background: 'black',
  backgroundColor: '#1a1a2e',
  blurRadius: 20,
};

interface StorageWrapper {
  version: number;
  data: Settings;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed: StorageWrapper = JSON.parse(raw);
    if (parsed.version !== STORAGE_VERSION || !parsed.data) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...parsed.data };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  const wrapper: StorageWrapper = { version: STORAGE_VERSION, data: settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
}

export function clearSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}

const ONBOARDING_KEY = 'ttk_onboarding_dismissed';

export function isOnboardingDismissed(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === '1';
}

export function dismissOnboarding(): void {
  localStorage.setItem(ONBOARDING_KEY, '1');
}
