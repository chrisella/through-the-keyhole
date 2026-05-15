import { useRef } from 'react';

interface Props {
  onFile: (file: File) => void;
}

export function EmptyState({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  }

  return (
    <div className="empty-state" onClick={handleClick}>
      <div className="empty-state-content">
        <div className="empty-state-icon">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="26" r="12" stroke="currentColor" strokeWidth="3"/>
            <path d="M26 36 L22 52 L42 52 L38 36" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="empty-state-title">Drop an image, paste, or click to upload</p>
        <p className="empty-state-hint">Supports JPG, PNG, GIF, WebP and more</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  );
}
