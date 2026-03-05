import { useState } from 'react';
import './PomodoroModal.css';

export default function PomodoroModal({ onStart, onClose }) {
  const [mins, setMins] = useState(25);

  const adjust = (delta) => setMins((v) => Math.min(120, Math.max(1, v + delta)));

  const handleStart = () => {
    if (mins < 1) return;
    onStart(mins);
  };

  return (
    <div className="pomo-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pomo-modal">
        <div className="pomo-modal-icon">{'\u23F1'}</div>
        <div>
          <div className="pomo-modal-title">Focus Mode</div>
          <div className="pomo-modal-sub">Set your session length</div>
        </div>
        <div className="pomo-input-wrap">
          <button className="pomo-minus" onClick={() => adjust(-5)}>
            -
          </button>
          <input
            type="number"
            className="pomo-minutes-input"
            value={mins}
            min={1}
            max={120}
            onChange={(e) => setMins(Math.min(120, Math.max(1, parseInt(e.target.value, 10) || 1)))}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          />
          <button className="pomo-plus" onClick={() => adjust(+5)}>
            +
          </button>
        </div>
        <button className="pomo-start-btn" onClick={handleStart}>
          Start Session
        </button>
        <button className="pomo-cancel" onClick={onClose}>
          cancel
        </button>
      </div>
    </div>
  );
}
