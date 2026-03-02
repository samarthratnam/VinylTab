import AlbumArtCanvas from './AlbumArtCanvas';
import './Record.css';

export default function Record({ isPlaying, art, thumbnail, title }) {
  return (
    <div className="record-wrap">
      <div className={`record ${isPlaying ? 'playing' : ''}`}>
        <div className="record-disc">
          <div className="record-disc-shine" />
          <div className="record-label">
            <AlbumArtCanvas art={art} thumbnail={thumbnail} alt={title} />
            <div className="spindle" />
          </div>
        </div>
      </div>

      <div className="tonearm-pivot" />
      <div className={`tonearm ${isPlaying ? 'playing' : ''}`} />
    </div>
  );
}
