import Waveform from './Waveform';
import TrackList from './TrackList';
import './InfoPanel.css';

function fmt(s) {
  const safe = Number.isFinite(s) ? Math.max(0, Math.floor(s)) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

export default function InfoPanel({
  track,
  tracks,
  isPlaying,
  elapsed,
  volume,
  currentTrackIdx,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onSelectTrack
}) {
  const pct = track.total > 0 ? Math.min(100, Math.max(0, (elapsed / track.total) * 100)) : 0;
  const seekValue = Math.round((pct / 100) * 1000);

  return (
    <div className="info-panel">
      <div className="track-info">
        <div className="track-label">Now Playing</div>
        <div className="track-name">{track.name}</div>
        <div className="track-artist">{track.artist}</div>
      </div>

      <Waveform isPlaying={isPlaying} />

      <div className="controls">
        <button className="ctrl-btn" onClick={onPrev}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>
        <button className="play-btn" onClick={onTogglePlay}>
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            {isPlaying ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /> : <path d="M8 5v14l11-7z" />}
          </svg>
        </button>
        <button className="ctrl-btn" onClick={onNext}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zm2-8.14 5.5 3.89L8 13.86V9.86zM16 6h2v12h-2z" />
          </svg>
        </button>
        <div className="vol-row">
          <svg className="vol-icon" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            className="vol-slider"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="progress-section" style={{ '--seek-pct': `${pct}%` }}>
        <input
          type="range"
          className="progress-slider"
          min="0"
          max="1000"
          step="1"
          value={seekValue}
          onChange={(e) => onSeek(Number(e.target.value) / 1000)}
          aria-label="Seek timeline"
        />
        <div className="times">
          <span>{fmt(elapsed)}</span>
          <span>{track.duration}</span>
        </div>
      </div>

      <div className="queue-section">
        <div className="queue-label">Playlist Queue</div>
        <TrackList tracks={tracks} currentIdx={currentTrackIdx} onSelect={onSelectTrack} />
      </div>
    </div>
  );
}
