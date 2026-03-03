import { useState } from 'react';
import './PlaylistGate.css';

function summarizeError(error) {
  const raw = String(error || '').trim();
  if (!raw) return '';
  const explicit = raw.match(/ERROR:\s*(.+)$/im);
  if (explicit?.[1]) return explicit[1].trim();
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines[0] || raw;
}

function isSourceExtractionError(error) {
  const text = String(error || '');
  return /unsupported url|yt-dlp|no tracks found|could not find playable youtube matches|falling back on generic extractor/i.test(
    text
  );
}

export default function PlaylistGate({ onSubmit, isLoading, error }) {
  const [url, setUrl] = useState('');
  const showSourceHint = isSourceExtractionError(error);
  const shortError = summarizeError(error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(url);
  };

  return (
    <div className="playlist-gate">
      <div className="gate-glow gate-glow-left" />
      <div className="gate-glow gate-glow-right" />

      <form className="gate-card" onSubmit={handleSubmit}>
        <div className="gate-label">Playlist Required</div>
        <h1 className="gate-title">Paste A Playlist Link</h1>
        <p className="gate-copy">
          Drop a playlist URL from any platform to start. After submit, the vinyl player opens and runs tracks in
          order.
        </p>

        <input
          className="gate-input"
          type="url"
          placeholder="https://open.spotify.com/playlist/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          required
        />

        <button className="gate-btn" type="submit" disabled={isLoading || !url.trim()}>
          {isLoading ? 'Loading...' : 'Load Playlist'}
        </button>

        {error ? (
          <div className="gate-error-wrap">
            <div className="gate-error-head">Could not import this playlist</div>
            <div className="gate-error">{shortError}</div>

            {showSourceHint ? (
              <div className="gate-explain">
                <div className="gate-explain-title">Why this happens</div>
                <p className="gate-explain-copy">
                  This app does not stream directly from Apple Music, TIDAL, or SoundCloud. It first tries to extract
                  track metadata (name + artist), then maps that metadata to YouTube.
                </p>
                <ul className="gate-explain-list">
                  <li>If the playlist is private/login-only, metadata cannot be read.</li>
                  <li>Some URLs are region/account-gated and are blocked for public extractors.</li>
                  <li>When extraction fails, YouTube mapping cannot start.</li>
                </ul>
                <div className="gate-explain-tip">
                  Best reliability: test with public Spotify or YouTube playlist links.
                </div>
              </div>
            ) : null}

            <details className="gate-tech">
              <summary>Technical details</summary>
              <pre>{String(error)}</pre>
            </details>
          </div>
        ) : null}
        <div className="gate-note">
          Public playlists are resolved and then matched to YouTube in order. Private/login-only playlists may fail.
        </div>
      </form>
    </div>
  );
}
