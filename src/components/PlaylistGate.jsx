import { useState } from 'react';
import './PlaylistGate.css';

export default function PlaylistGate({ onSubmit, isLoading, error }) {
  const [url, setUrl] = useState('');

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

        {error ? <div className="gate-error">{error}</div> : null}
        <div className="gate-note">
          Public playlists are resolved and then matched to YouTube in order. Private/login-only playlists may fail.
        </div>
      </form>
    </div>
  );
}
