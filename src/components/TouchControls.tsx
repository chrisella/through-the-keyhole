interface Props {
  hasImage: boolean;
  revealed: boolean;
  onReveal: () => void;
  onReset: () => void;
}

export function TouchControls({ hasImage, revealed, onReveal, onReset }: Props) {
  return (
    <div className="touch-controls">
      {hasImage && !revealed && (
        <button className="touch-btn touch-btn--reveal" onClick={onReveal}>
          Reveal
        </button>
      )}
      {hasImage && (
        <button className="touch-btn touch-btn--reset" onClick={onReset}>
          Reset
        </button>
      )}
    </div>
  );
}
