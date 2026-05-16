import { Settings, Shape, BackgroundMode, MoveMode } from '../types';
import { MIN_SIZE, MAX_SIZE } from '../render/shapes';
import { DEFAULT_SETTINGS } from '../lib/storage';

interface Props {
  open: boolean;
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
  onReset: () => void;
  showHelp: boolean;
  onToggleHelp: () => void;
}

const SHAPES: { value: Shape; label: string }[] = [
  { value: 'keyhole', label: 'Keyhole' },
  { value: 'circle', label: 'Circle' },
  { value: 'rect', label: 'Square' },
  { value: 'star', label: 'Star' },
];

const BG_MODES: { value: BackgroundMode; label: string }[] = [
  { value: 'black', label: 'Black' },
  { value: 'color', label: 'Colour' },
  { value: 'blur', label: 'Blurred image' },
];

const SHORTCUTS = [
  { key: 'Space', desc: 'Reveal image' },
  { key: 'Scroll wheel', desc: 'Resize keyhole' },
  { key: '+ / −', desc: 'Resize keyhole' },
  { key: 'Ctrl+V', desc: 'Paste image' },
  { key: 'Drag', desc: 'Move keyhole' },
  { key: 'Drop', desc: 'Load image' },
  { key: 'Esc', desc: 'Toggle settings' },
  { key: '?', desc: 'Toggle shortcuts' },
];

export function SettingsPanel({ open, settings, onUpdate, onReset, showHelp, onToggleHelp }: Props) {
  return (
    <aside className={`settings-panel ${open ? 'settings-panel--open' : ''}`}>
      <div className="settings-panel-inner">
        <h2 className="settings-heading">Settings</h2>

        <section className="settings-section">
          <label className="settings-label">Shape</label>
          <div className="shape-picker">
            {SHAPES.map(s => (
              <button
                key={s.value}
                className={`shape-btn ${settings.shape === s.value ? 'shape-btn--active' : ''}`}
                onClick={() => onUpdate({ shape: s.value })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <label className="settings-label">
            Size <span className="settings-value">{Math.round(settings.size)}px</span>
          </label>
          <input
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={settings.size}
            onChange={e => onUpdate({ size: Number(e.target.value) })}
            className="settings-range"
          />
        </section>

        <section className="settings-section">
          <label className="settings-label">Mouse movement</label>
          <div className="move-toggle">
            {([['hover', 'Hover'], ['drag', 'Click & drag']] as [MoveMode, string][]).map(([value, label]) => (
              <button
                key={value}
                className={`shape-btn ${settings.moveMode === value ? 'shape-btn--active' : ''}`}
                onClick={() => onUpdate({ moveMode: value })}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <label className="settings-label">Background</label>
          <div className="bg-picker">
            {BG_MODES.map(m => (
              <label key={m.value} className="bg-radio">
                <input
                  type="radio"
                  name="background"
                  value={m.value}
                  checked={settings.background === m.value}
                  onChange={() => onUpdate({ background: m.value })}
                />
                {m.label}
              </label>
            ))}
          </div>
          {settings.background === 'color' && (
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={e => onUpdate({ backgroundColor: e.target.value })}
              className="settings-color"
            />
          )}
          {settings.background === 'blur' && (
            <div className="settings-blur-row">
              <label className="settings-label">
                Blur <span className="settings-value">{settings.blurRadius}px</span>
              </label>
              <input
                type="range"
                min={2}
                max={80}
                value={settings.blurRadius}
                onChange={e => onUpdate({ blurRadius: Number(e.target.value) })}
                className="settings-range"
              />
            </div>
          )}
        </section>

        <section className="settings-section">
          <button className="settings-help-toggle" onClick={onToggleHelp}>
            Shortcuts {showHelp ? '▲' : '▼'}
          </button>
          {showHelp && (
            <dl className="shortcuts-list">
              {SHORTCUTS.map(s => (
                <div key={s.key} className="shortcut-row">
                  <dt className="shortcut-key">{s.key}</dt>
                  <dd className="shortcut-desc">{s.desc}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <section className="settings-section">
          <button className="reset-btn" onClick={onReset}>
            Reset to defaults
          </button>
          <p className="reset-hint">Restores shape, size and background settings. Does not clear your image.</p>
        </section>

        <p className="settings-version">v{DEFAULT_SETTINGS.size}</p>
      </div>
    </aside>
  );
}
