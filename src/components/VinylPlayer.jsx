import { useState, useEffect, useRef } from 'react';
import Record from './Record';
import InfoPanel from './InfoPanel';
import TrackList from './TrackList';
import { TRACKS } from '../data/tracks';
import YouTubeAudioBridge from './YouTubeAudioBridge';
import './VinylPlayer.css';

export default function VinylPlayer({ isLight, onToggleMode, playlist, onChangePlaylist }) {
  const tracks = playlist?.tracks?.length ? playlist.tracks : TRACKS;
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isPlaylistPanelOpen, setIsPlaylistPanelOpen] = useState(false);
  const playerRef = useRef(null);
  const syncRef = useRef(null);
  const track = tracks[currentTrack] || tracks[0];
  const platform = playlist?.platform || 'Playlist';
  const playlistName = playlist?.name || 'Now Playing';
  const sourceTrackCount = Number(playlist?.sourceTrackCount || tracks.length);
  const importedTrackCount = Number(playlist?.importedTrackCount || tracks.length);

  useEffect(() => {
    clearInterval(syncRef.current);
    if (!isPlaying || !playerRef.current) return undefined;

    syncRef.current = setInterval(() => {
      try {
        const now = Math.floor(playerRef.current.getCurrentTime() || 0);
        setElapsed(now);
      } catch {
        // Player may not be ready between track changes.
      }
    }, 500);

    return () => clearInterval(syncRef.current);
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    setCurrentTrack(0);
    setElapsed(0);
    setIsPlaying(true);
    setIsPlaylistPanelOpen(false);
    clearInterval(syncRef.current);
  }, [playlist?.url]);

  useEffect(() => {
    setElapsed(0);
  }, [currentTrack]);

  useEffect(() => {
    if (!isPlaylistPanelOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsPlaylistPanelOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaylistPanelOpen]);

  const handleSeek = (pct) => {
    const player = playerRef.current;
    const duration = player?.getDuration?.() || track.total;
    const target = Math.floor(Math.max(0, Math.min(duration, pct * duration)));
    if (player?.seekTo) {
      player.seekTo(target, true);
    }
    setElapsed(target);
  };

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player) {
      setIsPlaying((p) => !p);
      return;
    }
    if (isPlaying) {
      player.pauseVideo();
      setIsPlaying(false);
    } else {
      player.playVideo();
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((c) => (c + 1) % tracks.length);
    setElapsed(0);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrack((c) => (c - 1 + tracks.length) % tracks.length);
    setElapsed(0);
    setIsPlaying(true);
  };

  const handlePlayerReady = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
    if (isPlaying) event.target.playVideo();
  };

  const handlePlayerStateChange = (event) => {
    // 0 ended, 1 playing, 2 paused
    if (event.data === 0) {
      setCurrentTrack((c) => (c + 1) % tracks.length);
      setElapsed(0);
      setIsPlaying(true);
      return;
    }
    if (event.data === 1) setIsPlaying(true);
    if (event.data === 2) setIsPlaying(false);
  };

  const handleVolumeChange = (nextVolume) => {
    setVolume(nextVolume);
    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(nextVolume);
    }
  };

  const closePanel = () => {
    setIsPlaylistPanelOpen(false);
  };

  const handleSelectTrack = (idx) => {
    setCurrentTrack(idx);
    setElapsed(0);
    setIsPlaying(true);
  };

  const handlePanelSelectTrack = (idx) => {
    handleSelectTrack(idx);
    closePanel();
  };

  const handleChangePlaylist = () => {
    closePanel();
    onChangePlaylist();
  };

  return (
    <div className="player">
      <div className="player-header">
        <button
          className="playlist-toggle-btn"
          onClick={() => setIsPlaylistPanelOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isPlaylistPanelOpen}
        >
          Playlists
        </button>
        <button className="mode-toggle" onClick={onToggleMode}>
          <span className={`mode-icon ${isLight ? 'rotated' : ''}`}>
            {isLight ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          </span>
          <span>{isLight ? 'Day' : 'Night'}</span>
        </button>
      </div>

      <div className="glow-left" />
      <div className="glow-right" />

      <div className="player-content">
        <Record isPlaying={isPlaying} art={track.art} thumbnail={track.thumbnail} title={track.name} />

        <InfoPanel
          track={track}
          tracks={tracks}
          isPlaying={isPlaying}
          elapsed={elapsed}
          volume={volume}
          currentTrackIdx={currentTrack}
          onTogglePlay={togglePlay}
          onNext={nextTrack}
          onPrev={prevTrack}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onSelectTrack={handleSelectTrack}
        />
      </div>

      {isPlaylistPanelOpen ? (
        <div className="playlist-panel-overlay" onClick={closePanel}>
          <aside className="playlist-panel" onClick={(event) => event.stopPropagation()}>
            <div className="playlist-panel-head">
              <div className="playlist-panel-copy">
                <span className="playlist-panel-platform">{platform}</span>
                <h2>{playlistName}</h2>
                <p>
                  {importedTrackCount} playable tracks loaded
                  {sourceTrackCount > importedTrackCount ? ` from ${sourceTrackCount} source tracks.` : '.'}
                </p>
              </div>
              <button className="playlist-panel-close" onClick={closePanel} aria-label="Close playlists">
                X
              </button>
            </div>

            <div className="playlist-panel-list">
              <TrackList
                tracks={tracks}
                currentIdx={currentTrack}
                onSelect={handlePanelSelectTrack}
                className="track-list--panel"
              />
            </div>

            <button className="playlist-change-btn" onClick={handleChangePlaylist}>
              Change Playlist Link
            </button>
          </aside>
        </div>
      ) : null}

      {track?.youtubeId ? (
        <YouTubeAudioBridge
          videoId={track.youtubeId}
          isPlaying={isPlaying}
          onReady={handlePlayerReady}
          onStateChange={handlePlayerStateChange}
        />
      ) : null}
    </div>
  );
}
