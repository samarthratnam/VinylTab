import './TrackList.css';

export default function TrackList({ tracks, currentIdx, onSelect, className = '' }) {
  return (
    <div className={`track-list ${className}`.trim()}>
      {tracks.map((track, i) => (
        <div
          key={`${track.id ?? i}-${track.name}`}
          className={`track-item ${i === currentIdx ? 'active' : ''}`}
          onClick={() => onSelect(i)}
        >
          <span className="t-num">{String(i + 1).padStart(2, '0')}</span>
          {track.thumbnail ? (
            <img className="t-thumb" src={track.thumbnail} alt={`${track.name} cover`} loading="lazy" referrerPolicy="no-referrer" />
          ) : (
            <span className="t-thumb-fallback">\u266B</span>
          )}
          <span className="t-meta">
            <span className="t-name">{track.name}</span>
            <span className="t-artist">{track.artist}</span>
          </span>
          <span className="t-dur">{track.duration}</span>
        </div>
      ))}
    </div>
  );
}
