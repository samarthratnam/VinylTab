import { useEffect, useRef, useState } from 'react';
import AlbumArtCanvas from './AlbumArtCanvas';
import { drawTimerRing } from '../utils/drawTimerRing';
import './Record.css';

export default function Record({ isPlaying, art, thumbnail, title, isPomodoro, pomoLeft, pomoTotal }) {
  const wrapRef = useRef(null);
  const recordRef = useRef(null);
  const ringRef = useRef(null);
  const [ringGeometry, setRingGeometry] = useState({
    width: 380,
    height: 420,
    cx: 190,
    cy: 210,
    inner: 163,
    outer: 194
  });

  useEffect(() => {
    const updateGeometry = () => {
      const wrap = wrapRef.current;
      const record = recordRef.current;
      if (!wrap || !record) return;

      const wrapRect = wrap.getBoundingClientRect();
      const recordRect = record.getBoundingClientRect();
      const width = Math.max(1, Math.round(wrapRect.width));
      const height = Math.max(1, Math.round(wrapRect.height));
      const cx = width / 2;
      const cy = height / 2;
      const discRadius = Math.max(1, recordRect.width / 2);
      const inner = discRadius + Math.max(3, Math.round(discRadius * 0.02));
      const outer = inner + Math.max(12, Math.round(discRadius * 0.1));

      setRingGeometry((prev) => {
        const unchanged =
          prev.width === width &&
          prev.height === height &&
          Math.abs(prev.cx - cx) < 0.2 &&
          Math.abs(prev.cy - cy) < 0.2 &&
          Math.abs(prev.inner - inner) < 0.2 &&
          Math.abs(prev.outer - outer) < 0.2;
        if (unchanged) return prev;
        return { width, height, cx, cy, inner, outer };
      });
    };

    updateGeometry();

    const wrap = wrapRef.current;
    const record = recordRef.current;
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => updateGeometry()) : null;

    if (resizeObserver && wrap && record) {
      resizeObserver.observe(wrap);
      resizeObserver.observe(record);
    }

    window.addEventListener('resize', updateGeometry);
    return () => {
      window.removeEventListener('resize', updateGeometry);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!ringRef.current) return;
    const ctx = ringRef.current.getContext('2d');
    if (!ctx) return;

    if (isPomodoro && pomoTotal > 0) {
      drawTimerRing(ctx, pomoLeft, pomoTotal, ringGeometry.cx, ringGeometry.cy, {
        innerRadius: ringGeometry.inner,
        outerRadius: ringGeometry.outer
      });
    } else {
      ctx.clearRect(0, 0, ringGeometry.width, ringGeometry.height);
    }
  }, [isPomodoro, pomoLeft, pomoTotal, ringGeometry]);

  return (
    <div className="record-wrap" ref={wrapRef}>
      <div className={`record ${isPlaying ? 'playing' : ''}`} ref={recordRef}>
        <div className="record-disc">
          <div className="record-disc-shine" />
          <div className="record-label">
            <AlbumArtCanvas art={art} thumbnail={thumbnail} alt={title} />
            <div className="spindle" />
          </div>
        </div>
      </div>

      <canvas
        ref={ringRef}
        width={ringGeometry.width}
        height={ringGeometry.height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: isPomodoro ? 1 : 0,
          transition: 'opacity 0.7s ease',
          zIndex: 11
        }}
      />

      <div className="tonearm-pivot" />
      <div className={`tonearm ${isPlaying ? 'playing' : ''}`} />
    </div>
  );
}
