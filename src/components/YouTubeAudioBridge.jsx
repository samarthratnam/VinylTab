import YouTube from 'react-youtube';

export default function YouTubeAudioBridge({ videoId, isPlaying, onReady, onStateChange }) {
  return (
    <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
      <YouTube
        videoId={videoId}
        opts={{
          width: 0,
          height: 0,
          playerVars: {
            autoplay: isPlaying ? 1 : 0,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1
          }
        }}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
}
