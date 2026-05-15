import { dismissOnboarding } from '../lib/storage';

interface Props {
  onDismiss: () => void;
}

export function OnboardingTooltip({ onDismiss }: Props) {
  function handleDismiss() {
    dismissOnboarding();
    onDismiss();
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <h2 className="onboarding-title">Welcome to Through the Keyhole</h2>
        <p className="onboarding-desc">
          Load an image and let pupils see it through a moving keyhole — then reveal it all at once.
        </p>
        <ul className="onboarding-list">
          <li><strong>Drag</strong> — move the keyhole</li>
          <li><strong>Scroll / + −</strong> — resize the keyhole</li>
          <li><strong>Space</strong> — reveal the full image</li>
          <li><strong>Drop / Paste / Click</strong> — load an image</li>
          <li><strong>⚙</strong> — settings &amp; more shortcuts</li>
        </ul>
        <button className="onboarding-btn" onClick={handleDismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}
