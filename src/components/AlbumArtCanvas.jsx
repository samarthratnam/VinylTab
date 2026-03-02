import { useEffect, useRef, useState } from 'react';
import { drawAlbumArt } from '../utils/drawAlbumArt';

const FALLBACK_ART = { bg: ['#102332', '#1c102f'], shape: 'circles' };

export default function AlbumArtCanvas({ art, thumbnail, alt }) {
  const canvasRef = useRef(null);
  const [imageErrored, setImageErrored] = useState(false);

  useEffect(() => {
    setImageErrored(false);
  }, [thumbnail]);

  useEffect(() => {
    if (!canvasRef.current || (thumbnail && !imageErrored)) return;
    drawAlbumArt(canvasRef.current, art || FALLBACK_ART);
  }, [art, thumbnail, imageErrored]);

  if (thumbnail && !imageErrored) {
    return (
      <img
        src={thumbnail}
        alt={alt ? `${alt} cover` : 'Album art'}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setImageErrored(true)}
        style={{ width: 110, height: 110, borderRadius: '50%', display: 'block', objectFit: 'cover' }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={110}
      height={110}
      style={{ width: 110, height: 110, borderRadius: '50%', display: 'block' }}
    />
  );
}
