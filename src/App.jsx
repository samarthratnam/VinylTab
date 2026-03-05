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
      <div className="player-host">
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

      <section className="about-section" aria-labelledby="about-vinyltab-title">
        <article className="about-card">
          <img className="about-vinyl" src="/images/Vinyl.png" alt="" aria-hidden="true" />
          <h2 id="about-vinyltab-title">About VinylTab</h2>

          <div className="about-copy">
            <p>
              Hey guys <span aria-hidden="true">&#128075;</span>
            </p>
            <p>
              I vibe-coded this project because I was tired of getting interrupted by ads on Spotify and YouTube
              while trying to focus.
            </p>
            <p>
              VinylTab is a simple background music tab designed to help you stay in the flow while studying,
              coding, or working.
            </p>
            <p>If you&apos;d like to check out my other projects:</p>
            <a className="about-link" href="https://github.com/samarthratnam" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 .5C5.65.5.5 5.66.5 12.03c0 5.09 3.3 9.4 7.88 10.93.58.11.8-.26.8-.57 0-.28-.01-1.03-.02-2.02-3.2.7-3.88-1.55-3.88-1.55-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.15.09 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.95.11-.75.4-1.25.72-1.53-2.56-.29-5.25-1.28-5.25-5.72 0-1.27.46-2.32 1.19-3.14-.12-.3-.52-1.5.11-3.13 0 0 .98-.31 3.2 1.2a11 11 0 0 1 5.82 0c2.22-1.51 3.2-1.2 3.2-1.2.63 1.63.23 2.83.11 3.13.74.82 1.19 1.87 1.19 3.14 0 4.45-2.69 5.42-5.27 5.71.41.36.78 1.07.78 2.17 0 1.57-.01 2.84-.01 3.22 0 .31.21.69.81.57a11.53 11.53 0 0 0 7.86-10.93C23.5 5.66 18.35.5 12 .5z"
                />
              </svg>
              <span>GitHub &rarr; github.com/samarthratnam</span>
            </a>

            <p>You can also connect with me on LinkedIn:</p>
            <a
              className="about-link"
              href="https://www.linkedin.com/in/samarth-v-ratnam-13456534b/"
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.67H9.33V9h3.42v1.56h.05c.47-.9 1.63-1.85 3.35-1.85 3.59 0 4.26 2.37 4.26 5.46v6.28zM5.31 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.09 20.45H3.52V9h3.57v11.45zM22.23 0H1.77A1.77 1.77 0 0 0 0 1.77v20.46C0 23.21.79 24 1.77 24h20.46A1.77 1.77 0 0 0 24 22.23V1.77A1.77 1.77 0 0 0 22.23 0z"
                />
              </svg>
              <span>LinkedIn &rarr; linkedin.com/in/samarth-v-ratnam-13456534b</span>
            </a>

            <p>If you have suggestions, ideas, or feedback, feel free to message me on LinkedIn.</p>
          </div>
        </article>
      </section>
    </div>
  );
}
