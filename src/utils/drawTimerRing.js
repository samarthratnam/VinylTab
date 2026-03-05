/**
 * Draws a mechanical kitchen-timer bezel around the vinyl disc.
 * Call this every second with updated `left` (seconds remaining).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} left     - seconds remaining
 * @param {number} total    - total session seconds
 * @param {number} cx       - canvas centre X  (e.g. 190)
 * @param {number} cy       - canvas centre Y  (e.g. 210)
 * @param {{ innerRadius?: number, outerRadius?: number }} [options]
 */
export function drawTimerRing(ctx, left, total, cx, cy, options = {}) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (total <= 0) return;

  const safeLeft = Math.max(0, left);
  const TWO_PI = Math.PI * 2;
  const START = -Math.PI / 2;
  const arcFrac = safeLeft / total;
  const arcEnd = START + arcFrac * TWO_PI;
  const totalMins = total / 60;

  const maxRingRadius = Math.max(1, Math.min(cx, cy) - 6);
  const INNER = Math.max(1, Math.min(options.innerRadius ?? 163, maxRingRadius - 6));
  const OUTER = Math.max(INNER + 4, Math.min(options.outerRadius ?? 194, maxRingRadius));
  const ringThickness = OUTER - INNER;
  const showNumbers = OUTER >= 152;
  const numberStep = OUTER >= 176 ? 5 : 10;

  ctx.beginPath();
  ctx.arc(cx, cy, OUTER, 0, TWO_PI);
  ctx.arc(cx, cy, INNER, TWO_PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = '#1c1c1c';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + INNER * Math.cos(START), cy + INNER * Math.sin(START));
  ctx.arc(cx, cy, OUTER, START, arcEnd);
  ctx.arc(cx, cy, INNER, arcEnd, START, true);
  ctx.closePath();
  ctx.fillStyle = '#f0f0f0';
  ctx.fill();

  const shad = ctx.createRadialGradient(cx, cy, INNER - 2, cx, cy, INNER + 10);
  shad.addColorStop(0, 'rgba(0,0,0,0.18)');
  shad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.moveTo(cx + INNER * Math.cos(START), cy + INNER * Math.sin(START));
  ctx.arc(cx, cy, OUTER, START, arcEnd);
  ctx.arc(cx, cy, INNER, arcEnd, START, true);
  ctx.closePath();
  ctx.fillStyle = shad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, OUTER, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, INNER, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  for (let i = 0; i <= totalMins * 4; i += 1) {
    const frac = i / (totalMins * 4);
    const angle = START + frac * TWO_PI;
    const isMaj5 = i % 20 === 0;
    const isMaj1 = i % 4 === 0;
    const outerT = OUTER - 2;
    const depth = isMaj5 ? Math.max(8, ringThickness * 0.78) : isMaj1 ? Math.max(5, ringThickness * 0.5) : Math.max(3, ringThickness * 0.28);
    const innerT = outerT - depth;
    const skipMinor = OUTER < 165 && !isMaj1;
    if (skipMinor) continue;

    const x1 = cx + outerT * Math.cos(angle);
    const y1 = cy + outerT * Math.sin(angle);
    const x2 = cx + innerT * Math.cos(angle);
    const y2 = cy + innerT * Math.sin(angle);

    const onWhite = frac <= arcFrac + 0.001;
    ctx.strokeStyle = onWhite
      ? isMaj5
        ? 'rgba(0,0,0,0.85)'
        : isMaj1
          ? 'rgba(0,0,0,0.6)'
          : 'rgba(0,0,0,0.35)'
      : isMaj5
        ? 'rgba(255,255,255,0.22)'
        : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = isMaj5 ? 2 : isMaj1 ? 1.3 : 0.8;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  if (showNumbers) {
    const NUM_R = OUTER - Math.max(17, ringThickness * 1.15);
    for (let min = 0; min <= totalMins; min += numberStep) {
      const frac = min / totalMins;
      const angle = START + frac * TWO_PI;
      const nx = cx + NUM_R * Math.cos(angle);
      const ny = cy + NUM_R * Math.sin(angle);
      const onWhite = frac <= arcFrac + 0.005;

      ctx.save();
      ctx.translate(nx, ny);
      ctx.font = `bold ${min === 0 ? 8 : 7}px "Space Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = onWhite ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.16)';
      ctx.shadowBlur = 0;
      ctx.fillText(min === 0 ? totalMins : min, 0, 0);
      ctx.restore();
    }
  }

  const availableBelow = H - (cy + OUTER);
  const showPointer = availableBelow >= 8;
  if (showPointer) {
    const PTR_Y = Math.min(cy + OUTER + 5, H - 6);
    ctx.save();
    ctx.translate(cx, PTR_Y);
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(-3.8, 3.5);
    ctx.lineTo(3.8, 3.5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.shadowColor = 'rgba(255,255,255,0.35)';
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 0;
  }

  const showReadout = availableBelow >= 16;
  if (!showReadout) return;

  const timeY = Math.min(cy + OUTER + 17, H - 8);
  const m = Math.floor(safeLeft / 60);
  const s = safeLeft % 60;
  const timeStr = `${m}:${String(s).padStart(2, '0')}`;

  ctx.font = '700 10px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.fillText(timeStr, cx, timeY);
}
