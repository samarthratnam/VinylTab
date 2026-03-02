import { useMemo } from 'react';
import './Waveform.css';

export default function Waveform({ isPlaying }) {
  const bars = useMemo(
    () =>
      Array.from({ length: 55 }, () => ({
        height: 8 + Math.random() * 24,
        scale: 0.3 + Math.random() * 2.5,
        delay: Math.random() * 1.2,
        duration: 0.8 + Math.random() * 0.8,
        alpha: 0.2 + Math.random() * 0.5
      })),
    []
  );

  return (
    <div className="waveform">
      {bars.map((bar, i) => (
        <div
          key={i}
          className={`waveform-bar ${isPlaying ? 'playing' : ''}`}
          style={{
            height: bar.height,
            '--scale': bar.scale,
            animationDelay: `${bar.delay}s`,
            animationDuration: `${bar.duration}s`,
            background: `rgba(107,143,255,${bar.alpha})`
          }}
        />
      ))}
    </div>
  );
}
