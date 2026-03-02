export function drawAlbumArt(canvas, art) {
  const ctx = canvas.getContext('2d');
  const W = 110;
  const H = 110;
  const R = 55;

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath();
  ctx.arc(R, R, R, 0, Math.PI * 2);
  ctx.clip();

  // Background radial gradient
  const grad = ctx.createRadialGradient(R, R, 0, R, R, R);
  grad.addColorStop(0, art.bg[0]);
  grad.addColorStop(1, art.bg[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // --- CITY (Midnight Drive) ---
  if (art.shape === 'city') {
    ctx.fillStyle = 'rgba(255,107,107,0.15)';
    ctx.beginPath();
    ctx.arc(R, R, 30, 0, Math.PI * 2);
    ctx.fill();

    // Moon
    ctx.fillStyle = '#ffe566';
    ctx.beginPath();
    ctx.arc(72, 28, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = art.bg[0];
    ctx.beginPath();
    ctx.arc(76, 26, 8, 0, Math.PI * 2);
    ctx.fill();

    // Buildings
    ctx.fillStyle = '#0a0a1a';
    const blds = [
      [10, 70, 14],
      [26, 75, 10],
      [38, 68, 12],
      [52, 72, 10],
      [64, 65, 16],
      [82, 70, 12],
      [96, 74, 14]
    ];
    blds.forEach(([x, y, w]) => ctx.fillRect(x, y, w, H - y));

    // Windows
    ctx.fillStyle = '#ffe566';
    blds.forEach(([x, y, w]) => {
      for (let wy = y + 4; wy < H - 10; wy += 8) {
        for (let wx = x + 3; wx < x + w - 3; wx += 5) {
          if (Math.random() > 0.4) ctx.fillRect(wx, wy, 2, 3);
        }
      }
    });

    // Ground glow
    const glow = ctx.createLinearGradient(0, H - 20, 0, H);
    glow.addColorStop(0, 'rgba(255,107,107,0.3)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, H - 20, W, 20);
  }
  // --- WAVE (Neon Haze) ---
  else if (art.shape === 'wave') {
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `hsla(${160 + i * 15},100%,${50 + i * 5}%,${0.6 - i * 0.08})`;
      ctx.lineWidth = 1.5 - i * 0.15;
      ctx.beginPath();
      const amp = 12 - i * 1.5;
      const freq = 0.06 + i * 0.005;
      const off = i * 8;
      ctx.moveTo(0, R + off);
      for (let x = 0; x <= W; x += 2) {
        ctx.lineTo(x, R + Math.sin(x * freq + i) * amp + off - 20);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = `rgba(0,255,200,${Math.random() * 0.6 + 0.2})`;
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // --- FIRE (Slow Burn) ---
  else if (art.shape === 'fire') {
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = `hsla(${20 + i * 10},100%,${50 + i * 8}%,${0.4 + i * 0.1})`;
      ctx.beginPath();
      const cx = 20 + i * 18;
      const base = H;
      ctx.moveTo(cx, base);
      ctx.bezierCurveTo(cx - 12, base - 25, cx - 8, base - 45, cx, base - 55 + i * 5);
      ctx.bezierCurveTo(cx + 8, base - 45, cx + 12, base - 25, cx + 18, base);
      ctx.closePath();
      ctx.fill();
    }
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(255,${150 + Math.random() * 100},0,${Math.random() * 0.8 + 0.2})`;
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H * 0.7, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // --- CIRCLES (Echo Garden) ---
  else if (art.shape === 'circles') {
    for (let i = 8; i > 0; i--) {
      ctx.strokeStyle = `rgba(136,255,170,${0.05 + (8 - i) * 0.04})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(R, R, i * 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const dist = 20 + (i % 3) * 8;
      ctx.fillStyle = `rgba(136,255,170,${0.2 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(R + Math.cos(angle) * dist, R + Math.sin(angle) * dist, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    const cg = ctx.createRadialGradient(R, R, 0, R, R, 20);
    cg.addColorStop(0, 'rgba(136,255,170,0.3)');
    cg.addColorStop(1, 'transparent');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(R, R, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Warm cream wash over all art (keeps whitish tone)
  ctx.save();
  ctx.beginPath();
  ctx.arc(R, R, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(255, 248, 235, 0.22)';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
