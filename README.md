# VinylTab Playlist Vinyl Player

A React + Vite vinyl-style music player that accepts a playlist URL, resolves tracks from the source platform, maps them to playable YouTube audio, and plays them in an interactive vinyl UI.

## What this project does

- Accepts a playlist URL from the user.
- Resolves playlist metadata from supported platforms.
- Converts source tracks into playable YouTube IDs.
- Plays tracks in order with seek, volume, next/prev, and direct track selection.
- Provides a day/night visual mode toggle.

## Project theory (how it works)

The project is built around a **resolver + player** architecture:

1. **Playlist ingestion layer (frontend):**
   - `src/components/PlaylistGate.jsx` collects a playlist URL.
   - `src/App.jsx` sends the URL to `POST /api/resolve-playlist`.

2. **Platform resolution layer (backend):**
   - `server/playlistService.js` infers the source platform from URL host.
   - Spotify URLs are resolved using `spotify-url-info`.
   - Other links are resolved with `yt-dlp` metadata extraction.

3. **Normalization and matching layer:**
   - Source tracks are normalized into a common shape (`name`, `artist`, `duration`).
   - Each track is mapped to a YouTube video ID (direct ID if available, otherwise search query).
   - Concurrency control and timeout logic keep resolution responsive.

4. **Playback/control layer (frontend):**
   - `src/components/VinylPlayer.jsx` manages player state (`isPlaying`, `elapsed`, track index, volume).
   - `src/components/YouTubeAudioBridge.jsx` hosts a hidden YouTube player (`react-youtube`) as the actual audio engine.
   - UI components (`Record`, `InfoPanel`, `TrackList`, `Waveform`) render controls and visuals.

This separation keeps external playlist handling on the backend and playback UX on the frontend.

## Tech stack

- Frontend: React 18, Vite
- Backend: Node.js + Express
- Playlist metadata: `spotify-url-info`, `yt-dlp`
- Playback bridge: `react-youtube`

## Prerequisites

- Node.js 18+ (recommended)
- npm
- Python 3
- `yt-dlp` installed in Python environment

Windows install example:

```bash
py -m pip install yt-dlp
```

macOS/Linux install example:

```bash
python3 -m pip install yt-dlp
```

## Setup

From `Project2`:

```bash
npm install
```

## Run the app

```bash
npm run dev
```

On startup, the dev launcher prints the API port it selected, for example:

```text
[dev] Using API_PORT=8787
```

This starts:

- Vite frontend (default `http://localhost:5173`)
- Express API (`http://127.0.0.1:<API_PORT>`)

Vite proxies `/api` requests to the same `API_PORT` automatically.

## How to use

1. Open the app in your browser.
2. Paste a public playlist link (for example Spotify/YouTube/SoundCloud).
3. Click **Load Playlist**.
4. Use controls to play/pause, seek, change volume, and move next/previous.
5. Click any track in the track list to jump to it.
6. Use **Change Playlist** to load another URL.

## Supported source platforms

Platform detection is hostname-based and currently includes:

- Spotify
- YouTube
- SoundCloud
- Apple Music
- Deezer
- TIDAL
- Other URLs are treated as generic external playlists when possible.

## Current limits and behavior

- Only public/accessible playlists work reliably.
- Import is capped to the first 12 tracks (`MAX_TRACKS`).
- YouTube matching is search-based for many sources, so rare mismatches can happen.
- If no playable YouTube matches are found, the API returns an error.

## API endpoints

- `GET /api/health` -> service health check
- `POST /api/resolve-playlist` with body:

```json
{ "url": "https://..." }
```

Returns resolved playlist payload with mapped tracks and YouTube IDs.

## Scripts

- `npm run dev` - auto-select free API port and run frontend + backend
- `npm run dev:raw` - run frontend + backend concurrently using current `API_PORT`
- `npm run dev:client` - run Vite only
- `npm run dev:server` - run Express API only
- `npm run build` - production build
- `npm run preview` - preview production build

## Troubleshooting: "Failed to fetch"

If clicking **Load Playlist** shows "Failed to fetch":

1. Start both services with:

```bash
npm run dev
```

2. Check the selected API port in terminal output:

```text
[dev] Using API_PORT=8787
```

3. Verify health on that port:

```text
http://127.0.0.1:<API_PORT>/api/health
```

4. If you manually set `API_PORT`, ensure it is free, or unset it and rerun `npm run dev`.

5. If stale servers remain (Windows PowerShell), stop them:

```powershell
Get-CimInstance Win32_Process |
  Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'server/index.js' } |
  Select-Object -ExpandProperty ProcessId |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

Optional for non-proxy setups:

- Set `VITE_API_BASE_URL` to your backend origin (example: `http://127.0.0.1:8790`).
