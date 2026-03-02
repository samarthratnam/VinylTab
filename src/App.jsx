import { useState } from 'react';
import VinylPlayer from './components/VinylPlayer';
import PlaylistGate from './components/PlaylistGate';
import './App.css';

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export default function App() {
  const [isLight, setIsLight] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleMode = () => {
    setIsLight((prev) => {
      const next = !prev;
      document.body.classList.toggle('light', next);
      return next;
    });
  };

  const handleLoadPlaylist = async (url) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/resolve-playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      let data = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { error: text } : null;
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to resolve playlist link.');
      }

      setPlaylist(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load playlist link.';
      if (/failed to fetch/i.test(msg)) {
        setError('Could not reach the playlist API. Start both servers with `npm run dev`, then verify `/api/health` (or `http://127.0.0.1:<API_PORT>/api/health`).');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlaylist = () => {
    setPlaylist(null);
    setError('');
  };

  return (
    <div className="app-shell">
      {playlist ? (
        <VinylPlayer
          isLight={isLight}
          onToggleMode={toggleMode}
          playlist={playlist}
          onChangePlaylist={handleChangePlaylist}
        />
      ) : (
        <PlaylistGate onSubmit={handleLoadPlaylist} isLoading={isLoading} error={error} />
      )}
    </div>
  );
}
